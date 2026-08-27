{
  "version": 2,
  "buildCommand": "npm run build --workspace=artifacts/mockup-sandbox",
  "outputDirectory": "artifacts/mockup-sandbox/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
