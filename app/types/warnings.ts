// Types for Student Warnings System

export interface StudentWarning {
    id: number
    tenant_id: number
    warning_type_id: number | null
    student_id: number
    reported_by_id: number
    title: string
    status: 'open' | 'closed'
    closed_at: string | null
    closed_by_id: number | null
    created_at: string
    updated_at: string

    // Relationships
    warningType?: {
        id: number
        name: string
        description: string | null
    }
    student?: {
        id: number
        nombres: string
        apellidos: string
        cedula: string | null
        numero_orden: number
        aula?: {
            id: number
            grado_cardinal: string
            seccion: string
        }
        user?: {
            id: number
            name: string
            email: string
        }
    }
    reportedBy?: {
        id: number
        name: string
        email: string
        role: string
    }
    reported_by?: {
        id: number
        name: string
        email: string
        role: string
    }
    closedBy?: {
        id: number
        name: string
        email: string
    }
    entries?: StudentWarningEntry[]
}

export interface StudentWarningEntry {
    id: number
    warning_id: number
    user_id: number
    tenant_id: number
    content: string
    date_of_event: string
    attachments: any[] | null
    created_at: string
    updated_at: string

    // Relationships
    author?: {
        id: number
        name: string
        email: string
        role: string
    }
}
