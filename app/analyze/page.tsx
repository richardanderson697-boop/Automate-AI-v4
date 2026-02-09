import AnalyzeClient from './analyze-client'

export const metadata = {
  title: 'Vehicle Analysis - Pocket Mechanic AI',
  description: 'Upload photos, record sounds, and get AI-powered vehicle diagnostics',
}

export default function AnalyzePage() {
  return <AnalyzeClient />
}
