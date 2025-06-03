
export const HypReceipts = {
  /**
   * Generate payment receipt with HYP branding
   */
  async generateHypReceipt(paymentId: string): Promise<string> {
    try {
      // This would typically call your receipt generation service
      // For now, just return a placeholder URL
      return `/receipts/hyp-${paymentId}.pdf`
    } catch (error) {
      console.error("Error generating HYP receipt:", error)
      throw error
    }
  },
}
