/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@web3modal/wagmi'],

    // SECURITY FIX M-4: Additional security headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains'
                    },
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                ],
            },
        ]
    },

    webpack: (config: any) => {
        config.resolve.fallback = { fs: false, net: false, tls: false }
        config.externals.push('pino-pretty', 'lokijs', 'encoding')

        // Ignore test files in dependencies
        config.module.rules.push({
            test: /\.(test|spec)\.(js|ts|jsx|tsx)$/,
            loader: 'ignore-loader'
        })

        return config
    },
}

export default nextConfig
