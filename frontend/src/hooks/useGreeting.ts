import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

interface ApiResponse {
    message: string
}

// Example: Fetching personalized greeting
export const useGreeting = (initialState: string) => {
    const [name, setName] = useState(initialState);

    const query = useQuery<ApiResponse>({
        queryKey: ['greeting', name],
        queryFn: async () => {
            const response = await fetch(`/api/hello/${encodeURIComponent(name)}`)
            if (!response.ok) throw new Error('Failed to fetch greeting')
            return response.json()
        },
        enabled: name.length > 0,
    })

    return {
        ...query,
        name, setName
    };
}


