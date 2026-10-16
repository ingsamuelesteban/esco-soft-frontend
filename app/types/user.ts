export interface User {
    id: number
    name: string
    username: string
    email: string
    role: 'admin' | 'profesor' | 'master' | 'estudiante' | 'coordinador' | string
    personal_id?: number
    active: boolean
    profile_photo_path?: string
    profile_photo_url?: string
    initials?: string
    digital_signature_path?: string
    is_preadmitted?: boolean
    permissions_list?: string[]
    roles?: Array<{ id: number; name: string; permissions?: Array<{ name: string }> }>
    permissions?: Array<{ name: string }>
}
