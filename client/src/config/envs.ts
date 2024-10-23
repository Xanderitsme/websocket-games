process.loadEnvFile('../.env')

export const envs = {
  CLIENT_PORT: Number(process.env.CLIENT_PORT ?? 3001)
}
