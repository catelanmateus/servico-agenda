import { NextRequest, NextResponse } from 'next/server'
import { getCronManager, startCronJobs, stopCronJobs } from '../../../lib/cronJobs'

// GET - Status dos cron jobs
export async function GET(request: NextRequest) {
  try {
    const manager = getCronManager()
    const jobs = manager.getJobs()
    
    return NextResponse.json({
      message: 'Status dos cron jobs',
      timestamp: new Date().toISOString(),
      jobs: jobs.map(job => ({
        name: job.name,
        schedule: job.schedule,
        enabled: job.enabled,
        lastRun: job.lastRun,
        nextRun: job.nextRun
      }))
    })
  } catch (error) {
    console.error('❌ Erro ao obter status dos cron jobs:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Controlar cron jobs
export async function POST(request: NextRequest) {
  try {
    const { action, jobName } = await request.json()
    
    if (!action) {
      return NextResponse.json(
        { error: 'Ação é obrigatória (start, stop, enable, disable, start-all, stop-all)' },
        { status: 400 }
      )
    }

    const manager = getCronManager()
    let result = {}

    switch (action) {
      case 'start':
        if (!jobName) {
          return NextResponse.json(
            { error: 'Nome do job é obrigatório para start' },
            { status: 400 }
          )
        }
        manager.startJob(jobName)
        result = { message: `Job ${jobName} iniciado` }
        break

      case 'stop':
        if (!jobName) {
          return NextResponse.json(
            { error: 'Nome do job é obrigatório para stop' },
            { status: 400 }
          )
        }
        manager.stopJob(jobName)
        result = { message: `Job ${jobName} parado` }
        break

      case 'enable':
        if (!jobName) {
          return NextResponse.json(
            { error: 'Nome do job é obrigatório para enable' },
            { status: 400 }
          )
        }
        manager.enableJob(jobName)
        result = { message: `Job ${jobName} habilitado e iniciado` }
        break

      case 'disable':
        if (!jobName) {
          return NextResponse.json(
            { error: 'Nome do job é obrigatório para disable' },
            { status: 400 }
          )
        }
        manager.disableJob(jobName)
        result = { message: `Job ${jobName} desabilitado e parado` }
        break

      case 'start-all':
        startCronJobs()
        result = { message: 'Todos os jobs foram iniciados' }
        break

      case 'stop-all':
        stopCronJobs()
        result = { message: 'Todos os jobs foram parados' }
        break

      default:
        return NextResponse.json(
          { error: 'Ação inválida. Use: start, stop, enable, disable, start-all, stop-all' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
      jobs: manager.getJobs().map(job => ({
        name: job.name,
        schedule: job.schedule,
        enabled: job.enabled,
        lastRun: job.lastRun,
        nextRun: job.nextRun
      }))
    })

  } catch (error) {
    console.error('❌ Erro ao controlar cron jobs:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}