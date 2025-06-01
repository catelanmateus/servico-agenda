// Sistema de Cron Jobs para Lembretes Automáticos
// Este arquivo configura tarefas agendadas para envio de lembretes

interface CronJob {
  name: string
  schedule: string
  enabled: boolean
  lastRun?: string
  nextRun?: string
}

class CronJobManager {
  private jobs: CronJob[] = []
  private intervals: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.setupJobs()
  }

  private setupJobs() {
    // Job para verificar lembretes a cada 5 minutos
    this.addJob({
      name: 'reminder-check',
      schedule: '*/5 * * * *', // A cada 5 minutos
      enabled: true
    })
  }

  addJob(job: CronJob) {
    this.jobs.push(job)
    if (job.enabled) {
      this.startJob(job.name)
    }
  }

  startJob(jobName: string) {
    const job = this.jobs.find(j => j.name === jobName)
    if (!job) return

    // Converter cron schedule para intervalo em milissegundos
    const intervalMs = this.cronToMs(job.schedule)
    
    const interval = setInterval(async () => {
      try {
        console.log(`🔄 Executando job: ${job.name}`);
        
        if (job.name === 'reminder-check') {
          await this.executeReminderCheck()
        }
        
        job.lastRun = new Date().toISOString()
        job.nextRun = new Date(Date.now() + intervalMs).toISOString()
        
      } catch (error) {
        console.error(`❌ Erro no job ${job.name}:`, error)
      }
    }, intervalMs)

    this.intervals.set(jobName, interval)
    console.log(`✅ Job ${jobName} iniciado (intervalo: ${intervalMs}ms)`)
  }

  stopJob(jobName: string) {
    const interval = this.intervals.get(jobName)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(jobName)
      console.log(`⏹️ Job ${jobName} parado`)
    }
  }

  private async executeReminderCheck() {
    try {
      // Chamar a API de lembretes
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/reminders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`📊 Verificação de lembretes:`, {
          enviados: result.remindersSent,
          erros: result.errors,
          total: result.totalChecked
        })
      } else {
        console.error('❌ Erro na verificação de lembretes:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro ao executar verificação de lembretes:', error)
    }
  }

  private cronToMs(cronExpression: string): number {
    // Conversão simples para */5 * * * * (a cada 5 minutos)
    if (cronExpression === '*/5 * * * *') {
      return 5 * 60 * 1000 // 5 minutos em milissegundos
    }
    
    // Conversão simples para */1 * * * * (a cada 1 minuto)
    if (cronExpression === '*/1 * * * *') {
      return 1 * 60 * 1000 // 1 minuto em milissegundos
    }
    
    // Default: 5 minutos
    return 5 * 60 * 1000
  }

  getJobs(): CronJob[] {
    return this.jobs
  }

  getJobStatus(jobName: string): CronJob | undefined {
    return this.jobs.find(j => j.name === jobName)
  }

  enableJob(jobName: string) {
    const job = this.jobs.find(j => j.name === jobName)
    if (job) {
      job.enabled = true
      this.startJob(jobName)
    }
  }

  disableJob(jobName: string) {
    const job = this.jobs.find(j => j.name === jobName)
    if (job) {
      job.enabled = false
      this.stopJob(jobName)
    }
  }

  startAll() {
    this.jobs.forEach(job => {
      if (job.enabled) {
        this.startJob(job.name)
      }
    })
    console.log('🚀 Todos os cron jobs foram iniciados')
  }

  stopAll() {
    this.intervals.forEach((interval, jobName) => {
      this.stopJob(jobName)
    })
    console.log('⏹️ Todos os cron jobs foram parados')
  }
}

// Instância global do gerenciador de cron jobs
let cronManager: CronJobManager | null = null

export function getCronManager(): CronJobManager {
  if (!cronManager) {
    cronManager = new CronJobManager()
  }
  return cronManager
}

export function startCronJobs() {
  const manager = getCronManager()
  manager.startAll()
}

export function stopCronJobs() {
  const manager = getCronManager()
  manager.stopAll()
}

export default getCronManager