import { useQuery } from "@tanstack/react-query"

interface ApiResponse {
    message: string
}

export const useHealthStatus = () => {
    return useQuery<ApiResponse>({
        queryKey: ['health'],
        queryFn: async () => {
            const response = await fetch('/api/health')
            if (!response.ok) throw new Error('Health check failed')
            return response.json()
        },
    })
}