import { supabase } from "@/integrations/supabase/client"
import { v4 as uuidv4 } from "uuid"

export interface MemberFile {
  id: string
  member_id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  category: string
  description: string | null
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface FileUploadParams {
  memberId: string
  file: File
  category: string
  description?: string
}

export class MemberFilesService {
  static async getFiles(memberId: string): Promise<MemberFile[]> {
    try {
      const { data, error } = await supabase
        .from("member_files")
        .select("*")
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching member files:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error in getFiles:", error)
      throw error
    }
  }

  static async uploadFile({ memberId, file, category, description }: FileUploadParams): Promise<MemberFile> {
    try {
      // Generate a unique file path
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `member-files/${memberId}/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("member-files")
        .upload(filePath, file)

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        throw uploadError
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage.from("member-files").getPublicUrl(filePath)
      const fileUrl = urlData.publicUrl

      // Insert file metadata into the database
      const { data, error } = await supabase
        .from("member_files")
        .insert({
          member_id: memberId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: fileUrl,
          category,
          description: description || null,
        })
        .select()
        .single()

      if (error) {
        console.error("Error inserting file metadata:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in uploadFile:", error)
      throw error
    }
  }

  static async deleteFile(fileId: string): Promise<void> {
    try {
      // Get the file to delete
      const { data: fileData, error: fetchError } = await supabase
        .from("member_files")
        .select("file_url")
        .eq("id", fileId)
        .single()

      if (fetchError) {
        console.error("Error fetching file to delete:", fetchError)
        throw fetchError
      }

      // Extract the file path from the URL
      const fileUrl = fileData.file_url
      const filePath = fileUrl.split("/").slice(-2).join("/")

      // Delete the file from storage
      const { error: storageError } = await supabase.storage.from("member-files").remove([filePath])

      if (storageError) {
        console.error("Error deleting file from storage:", storageError)
        // Continue to delete the metadata even if storage deletion fails
      }

      // Delete the file metadata from the database
      const { error } = await supabase.from("member_files").delete().eq("id", fileId)

      if (error) {
        console.error("Error deleting file metadata:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in deleteFile:", error)
      throw error
    }
  }
}
