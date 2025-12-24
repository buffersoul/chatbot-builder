import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDocuments, uploadDocument, deleteDocument } from '../lib/api'
import { useBotStore } from '../store/botStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Trash, FileText, Upload, AlertCircle, File } from 'lucide-react'

function KnowledgeBasePage() {
    const [file, setFile] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState('')
    const queryClient = useQueryClient()

    const { selectedBotId } = useBotStore()

    // Fetch documents
    const { data: documentsData, isLoading } = useQuery({
        queryKey: ['documents', selectedBotId],
        queryFn: () => getDocuments(selectedBotId),
        enabled: !!selectedBotId
    })

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: (file) => uploadDocument(file, selectedBotId, (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['documents', selectedBotId])
            setFile(null)
            setUploadProgress(0)
            setError('')
        },
        onError: (err) => {
            setError(err.response?.data?.error || 'Failed to upload document')
            setUploadProgress(0)
        }
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteDocument,
        onSuccess: () => {
            queryClient.invalidateQueries(['documents', selectedBotId])
        }
    })

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            // Basic client-side validation
            const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
            if (!validTypes.includes(selectedFile.type)) {
                setError('Invalid file type. Please upload PDF, DOCX, or TXT.')
                setFile(null)
                return
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File too large. max 10MB.')
                setFile(null)
                return
            }
            setError('')
            setFile(selectedFile)
        }
    }

    const handleUpload = () => {
        if (file) {
            uploadMutation.mutate(file)
        }
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            deleteMutation.mutate(id)
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                <p className="text-muted-foreground mt-2">Upload documents to train your chatbot.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Upload Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Upload Document</CardTitle>
                        <CardDescription>Supported formats: PDF, DOCX, TXT</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!selectedBotId ? (
                            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                                Please select or create a bot in the sidebar before uploading documents.
                            </div>
                        ) : (
                            <>
                                <div className="grid w-full items-center gap-1.5">
                                    <Input
                                        type="file"
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                {uploadProgress > 0 && <Progress value={uploadProgress} />}

                                <Button
                                    className="w-full"
                                    disabled={!file || uploadMutation.isPending}
                                    onClick={handleUpload}
                                >
                                    {uploadMutation.isPending ? 'Uploading...' : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" /> Upload
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Documents List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>My Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!selectedBotId ? (
                            <div className="text-center text-muted-foreground py-8">
                                Select a bot to see its knowledge base.
                            </div>
                        ) : isLoading ? (
                            <div>Loading documents...</div>
                        ) : documentsData?.data?.documents?.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No documents uploaded yet.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documentsData?.data?.documents?.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                {doc.filename}
                                            </TableCell>
                                            <TableCell className="uppercase text-xs text-muted-foreground">{doc.file_type}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{(doc.file_size / 1024).toFixed(1)} KB</TableCell>
                                            <TableCell>
                                                <Badge variant={doc.status === 'completed' ? 'default' : doc.status === 'failed' ? 'destructive' : 'secondary'}>
                                                    {doc.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(doc.id)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default KnowledgeBasePage
