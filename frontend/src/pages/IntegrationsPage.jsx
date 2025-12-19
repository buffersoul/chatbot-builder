import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { getMetaAuthUrl, getMetaAssets, disconnectMetaAsset } from '../lib/api'
import { useLocation } from 'react-router-dom'

export default function IntegrationsPage() {
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)
    const [connecting, setConnecting] = useState(false)
    const location = useLocation()
    const [statusMessage, setStatusMessage] = useState(null)

    useEffect(() => {
        fetchAssets()
        const query = new URLSearchParams(location.search)
        if (query.get('status') === 'success') {
            setStatusMessage({ type: 'success', text: 'Integration connected successfully!' })
        }
    }, [location])

    const fetchAssets = async () => {
        try {
            const data = await getMetaAssets()
            setAssets(data)
        } catch (error) {
            console.error('Failed to fetch assets:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMetaConnect = async () => {
        try {
            setConnecting(true)
            const url = await getMetaAuthUrl()
            window.location.href = url
        } catch (error) {
            console.error('Failed to get auth URL:', error)
            setStatusMessage({ type: 'error', text: 'Failed to initiate connection.' })
            setConnecting(false)
        }
    }

    const handleDisconnect = async (assetId) => {
        if (!window.confirm('Are you sure you want to disconnect this asset?')) return
        try {
            await disconnectMetaAsset(assetId)
            setAssets(assets.filter(a => a.asset_id !== assetId))
            setStatusMessage({ type: 'success', text: 'Asset disconnected.' })
        } catch (error) {
            console.error('Disconnect failed:', error)
            setStatusMessage({ type: 'error', text: 'Failed to disconnect.' })
        }
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Integrations</h1>
                    <p className="text-muted-foreground mt-2">Manage your connections with external platforms.</p>
                </div>
            </div>

            {statusMessage && (
                <div className={`p-4 rounded border ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {statusMessage.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {/* Simple Facebook/Meta Icon Placeholder */}
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">f</div>
                            Meta (Facebook)
                        </CardTitle>
                        <CardDescription>
                            Connect your Facebook Pages to enable chatbot responses on Messenger.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={handleMetaConnect} disabled={connecting}>
                            {connecting ? 'Redirecting...' : 'Connect Facebook'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Connected Assets</CardTitle>
                    <CardDescription>Active connections serving your chatbot.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : assets.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No connected assets found.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Platform</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Connected At</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assets.map((asset) => (
                                    <TableRow key={asset.id}>
                                        <TableCell className="capitalize">{asset.platform}</TableCell>
                                        <TableCell className="font-medium">{asset.asset_name || 'N/A'}</TableCell>
                                        <TableCell>{asset.asset_id}</TableCell>
                                        <TableCell>
                                            <Badge variant={asset.is_active ? 'default' : 'secondary'}>
                                                {asset.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(asset.connected_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="sm" onClick={() => handleDisconnect(asset.asset_id)}>
                                                Disconnect
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
    )
}
