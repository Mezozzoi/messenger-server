
const rootConfig = () => ({
    envFilePath: `.env.${ process.env.NODE_ENV }`,
    isGlobal: true
})

export default rootConfig;