export interface Question {
    id: string,
    form_id: string,
    type: string,
    label: string,
    required: boolean,
    "order": number,
    options: any,
    created_at: Date
}

export interface CreateQuestionDto{
    type: string
    label: string
    required: boolean
    "order": number
    options?: any
}

export interface UpdateQuestionDto{
    type: string
    label: string
    required: boolean
    "order": number
    options?: any
}

// id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
// form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
// type TEXT NOT NULL,               
// label TEXT NOT NULL,
// required BOOLEAN DEFAULT false,
// "order" INT NOT NULL,
// options JSONB,                    
// created_at TIMESTAMP DEFAULT now()