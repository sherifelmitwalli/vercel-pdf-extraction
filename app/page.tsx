"use client"

import { useState, type ChangeEvent, type FormEvent, useEffect } from "react"
import { FileInput } from "../components/file-input"
import { Button } from "@/components/ui/button"
import { Loader2, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ExtractResponse {
  extracted_text: string
  page_count: number
}

// Fallback URL if the environment variable is not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pdf-extraction-9ot2.onrender.com"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    console.log("Component mounted")
    console.log("API URL:", API_URL)
  }, [])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      console.log("File selected:", selectedFile.name)
      setFile(selectedFile)
      setExtractedText("")
      setError("")
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a PDF file to upload.")
      return
    }

    setLoading(true)
    setError("")
    setExtractedText("")

    const formData = new FormData()
    formData.append("file", file)

    const requestUrl = `${API_URL}/extract`
    console.log("Sending request to:", requestUrl)

    try {
      console.log("Initiating fetch request")
      const response = await fetch(requestUrl, {
        method: "POST",
        body: formData,
      })

      console.log("Response received:", response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`Server error (${response.status}): ${response.statusText}`)
      }

      const data: ExtractResponse = await response.json()
      console.log("Data received:", data)

      if (data.extracted_text) {
        setExtractedText(data.extracted_text)
        console.log("Text extracted successfully")
      } else {
        throw new Error("No text was extracted from the PDF")
      }
    } catch (err) {
      console.error("Error during extraction:", err)
      setError(err instanceof Error ? err.message : "An error occurred while processing the PDF")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!extractedText) return

    const blob = new Blob([extractedText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "extracted_text.txt"
    a.click()
    URL.revokeObjectURL(url)
    console.log("Text downloaded")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-4xl font-bold text-primary-800 mb-2">PDF Text Extractor</h1>
            <p className="text-secondary-600 mb-8">
              Upload your PDF to extract text using our advanced backend.
              {file && <span className="ml-2 text-primary-600 font-medium">Selected: {file.name}</span>}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FileInput onChange={handleFileChange} accept="application/pdf" />
              <Button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Extract Text"
                )}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {extractedText && (
              <div className="mt-8 space-y-4">
                <h2 className="text-2xl font-semibold text-primary-800">Extracted Text</h2>
                <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                  <textarea
                    readOnly
                    value={extractedText}
                    rows={15}
                    className="w-full bg-transparent border-none resize-none font-mono text-sm focus:outline-none text-gray-800"
                  />
                </div>
                <Button
                  onClick={handleDownload}
                  className="w-full bg-secondary-600 hover:bg-secondary-700 text-white transition-colors duration-200"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Text
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


