import type { ReactNode } from "react"

const iconSize = 24
const iconProps = { width: iconSize, height: iconSize, viewBox: "0 0 24 24", "aria-hidden": true as const }

export function IconTextShort() {
    return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="14" x2="20" y2="14" />
        </svg>
    )
}

export function IconTextParagraph() {
    return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="14" y2="17" />
        </svg>
    )
}

export function IconRadio() {
    return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="6" />
        </svg>
    )
}

export function IconCheckbox() {
    return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6h12v12H6z" />
            <path d="M8 12l3 3 5-6" />
        </svg>
    )
}

export function IconSelect() {
    return (
        <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h16v8H4z" />
            <path d="M12 11l2 2 2-2" />
        </svg>
    )
}

const iconMap: Record<string, () => ReactNode> = {
    text: IconTextShort,
    textarea: IconTextParagraph,
    radio: IconRadio,
    checkbox: IconCheckbox,
    select: IconSelect,
}

export function getQuestionTypeIcon(type: string): ReactNode {
    const Icon = iconMap[type]
    return Icon ? <Icon /> : null
}
