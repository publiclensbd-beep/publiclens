import { useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient.js'

const MAX_BYTES = 2 * 1024 * 1024
const TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export default function CoverUpload({ value, onChange }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    setError('')
    if (!file) return

    const ext = TYPES[file.type]
    if (!ext) {
      setError('শুধু JPG, PNG বা WebP ছবি দেওয়া যাবে।')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('ছবির আকার ২ MB-এর বেশি হতে পারবে না।')
      return
    }

    setBusy(true)
    const name =
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8) +
      '.' +
      ext

    const { error: upErr } = await supabase.storage
      .from('covers')
      .upload(name, file, {
        contentType: file.type,
        cacheControl: '31536000',
      })

    if (upErr) {
      setBusy(false)
      setError('আপলোড হয়নি: ' + upErr.message)
      return
    }

    const { data } = supabase.storage.from('covers').getPublicUrl(name)
    setBusy(false)
    onChange(data.publicUrl)
  }

  return (
    <div className="form-row">
      <label>কভার ছবি</label>

      {value ? (
        <div className="cover" style={{ marginBottom: '8px' }}>
          <img src={value} alt="কভার ছবি" />
        </div>
      ) : (
        <p className="hint">কোনো ছবি বাছা হয়নি।</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      <div className="admin-actions">
        <button
          type="button"
          className="btn-small btn-outline"
          disabled={busy}
          onClick={() => inputRef.current.click()}
        >
          {busy ? 'আপলোড হচ্ছে...' : value ? 'ছবি বদলান' : 'ছবি বাছুন'}
        </button>
        {value && (
          <button
            type="button"
            className="btn-small btn-danger"
            disabled={busy}
            onClick={() => onChange('')}
          >
            ছবি সরান
          </button>
        )}
      </div>

      <p className="hint">JPG, PNG বা WebP, সর্বোচ্চ ২ MB।</p>
      {error && <p className="login-error">{error}</p>}
    </div>
  )
                  }
