import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/receipt/upload
// Body: multipart/form-data { file: File }
// Returns: { url, file_name, mime_type, uploaded_at }
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed. Use JPG, PNG, WebP, or PDF.' }, { status: 400 })
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 })
    }

    // Build a safe storage path: receipts/{user_id}/{timestamp}_{original_name}
    const ext = file.name.split('.').pop()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${user.id}/${Date.now()}_${safeName}`

    // Upload to Supabase Storage bucket "receipts"
    const arrayBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError || !uploadData) {
      return NextResponse.json({ error: uploadError?.message || 'Upload failed' }, { status: 500 })
    }

    // Get a signed URL valid for 10 years (effectively permanent for MVP)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('receipts')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365 * 10) // 10 years

    if (signedError || !signedData) {
      return NextResponse.json({ error: 'Could not generate receipt URL' }, { status: 500 })
    }

    return NextResponse.json({
      url: signedData.signedUrl,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type,
      uploaded_at: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
