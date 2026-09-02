import fs from 'node:fs'
import path from 'node:path'
import { createAdminClient } from '../lib/supabase/admin'
import type { Stage } from '../types/database'

// Ensure .env.local variables are loaded if not in environment
function loadEnv() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return
  }

  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const equalsIdx = trimmed.indexOf('=')
      if (equalsIdx > 0) {
        const key = trimmed.slice(0, equalsIdx).trim()
        const val = trimmed.slice(equalsIdx + 1).trim()
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

async function verifyDatabase() {
  console.log('====================================================')
  console.log('🔍 Callsy QA - Database & Supabase Verification')
  console.log('====================================================\n')

  loadEnv()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing environment variables NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  console.log(`🔑 Service Role Key: ${serviceKey.slice(0, 10)}...${serviceKey.slice(-5)}\n`)

  const supabase = createAdminClient()

  let hasErrors = false

  // 1. Verify Agents
  console.log('--- 1. Verifying "agents" table ---')
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: true })

  if (agentsError) {
    console.error('❌ Error querying agents table:', agentsError.message)
    hasErrors = true
  } else if (!agents || agents.length !== 4) {
    console.error(`❌ Expected 4 seeded agents, found ${agents?.length ?? 0}`)
    hasErrors = true
  } else {
    console.log(`✅ Found ${agents.length} seeded agents:`)
    for (const agent of agents) {
      console.log(`   - [${agent.id}] ${agent.name} <${agent.email}> (active: ${agent.active})`)
    }
  }
  console.log('')

  // 2. Verify Call Frameworks & Stages
  console.log('--- 2. Verifying "call_frameworks" table ---')
  const { data: frameworks, error: frameworksError } = await supabase
    .from('call_frameworks')
    .select('*')

  if (frameworksError) {
    console.error('❌ Error querying call_frameworks table:', frameworksError.message)
    hasErrors = true
  } else {
    const coldCalling = frameworks?.find((f) => f.name === 'Cold Calling Framework')
    if (!coldCalling) {
      console.error('❌ "Cold Calling Framework" not found in call_frameworks')
      hasErrors = true
    } else {
      const stages = (coldCalling.stages as unknown) as Stage[]
      if (!Array.isArray(stages) || stages.length !== 6) {
        console.error(`❌ Expected 6 stages in Cold Calling Framework, found ${stages?.length ?? 0}`)
        hasErrors = true
      } else {
        console.log(`✅ Found "Cold Calling Framework" (${coldCalling.id}) with 6 stages:`)
        for (const stage of stages) {
          const reqCount = stage.requirements?.length ?? 0
          console.log(`   - Stage ${stage.order}: "${stage.name}" (weight: ${stage.weight}%, requirements: ${reqCount})`)
        }
      }
    }
  }
  console.log('')

  // 3. Verify Storage Bucket
  console.log('--- 3. Verifying Storage Buckets ---')
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error('❌ Error listing storage buckets:', bucketsError.message)
    hasErrors = true
  } else {
    const recordingBucket = buckets?.find((b) => b.id === 'call-recordings' || b.name === 'call-recordings')
    if (!recordingBucket) {
      console.error('❌ "call-recordings" storage bucket not found')
      hasErrors = true
    } else {
      console.log(`✅ Storage bucket "${recordingBucket.name}" found (id: ${recordingBucket.id}, public: ${recordingBucket.public})`)
    }
  }
  console.log('')

  // 4. Verify Other Tables Schema (calls, transcripts, call_analyses)
  console.log('--- 4. Verifying Remaining Tables ---')
  const { error: callsErr } = await supabase.from('calls').select('id').limit(1)
  const { error: transcriptsErr } = await supabase.from('transcripts').select('id').limit(1)
  const { error: analysesErr } = await supabase.from('call_analyses').select('id').limit(1)

  if (callsErr) {
    console.error('❌ "calls" table check failed:', callsErr.message)
    hasErrors = true
  } else {
    console.log('✅ "calls" table accessible')
  }

  if (transcriptsErr) {
    console.error('❌ "transcripts" table check failed:', transcriptsErr.message)
    hasErrors = true
  } else {
    console.log('✅ "transcripts" table accessible')
  }

  if (analysesErr) {
    console.error('❌ "call_analyses" table check failed:', analysesErr.message)
    hasErrors = true
  } else {
    console.log('✅ "call_analyses" table accessible')
  }
  console.log('')

  // Summary
  if (hasErrors) {
    console.error('❌ Database verification FAILED with errors.')
    process.exit(1)
  } else {
    console.log('====================================================')
    console.log('🎉 ALL DATABASE VERIFICATION CHECKS PASSED!')
    console.log('====================================================')
    process.exit(0)
  }
}

verifyDatabase().catch((err) => {
  console.error('❌ Unexpected error during verification:', err)
  process.exit(1)
})
