

export interface FunctionDefinition {
    name: string;
    description: string;
    inputs: FunctionInput[];
    output: FunctionOutput;
}export interface FunctionOutput {
    type: string;
    description: string;
}
export interface FunctionInput {
    name: string;
    type: string;
    required: boolean;
    description: string;
}

