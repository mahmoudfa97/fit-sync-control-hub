"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Upload, X } from "lucide-react"
import { t } from "@/utils/translations"
import { MemberFilesService } from "@/services/MemberFilesService"

interface FileUploadDialogProps {
  memberId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function FileUploadDialog({ memberId, isOpen, onClose, onSuccess }: FileUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState("document")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const clearFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error(t("pleaseSelectFile"))
      return
    }

    try {
      setIsUploading(true)
      await MemberFilesService.uploadFile({
        memberId,
        file,
        category,
        description: description.trim() || undefined,
      })

      toast.success(t("fileUploadedSuccessfully"))
      onSuccess()
      handleClose()
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error(t("errorUploadingFile"))
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setCategory("document")
    setDescription("")
    onClose()
  }

  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("uploadFile")}</DialogTitle>
          <DialogDescription>{t("uploadFileDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!file ? (
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">{t("dragAndDropOrClick")}</p>
              <p className="text-xs text-muted-foreground">{t("maxFileSize")}</p>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      ) : (
                        <div className="text-xs font-medium text-center">
                          {file.name.split(".").pop()?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[180px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{getFileSize(file.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">{t("fileCategory")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">{t("document")}</SelectItem>
                <SelectItem value="medical">{t("medical")}</SelectItem>
                <SelectItem value="contract">{t("contract")}</SelectItem>
                <SelectItem value="progress">{t("progressPhoto")}</SelectItem>
                <SelectItem value="other">{t("other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("fileDescription")}</Label>
            <Textarea
              id="description"
              placeholder={t("fileDescriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {t("cancel")}
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("uploading")}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {t("upload")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
