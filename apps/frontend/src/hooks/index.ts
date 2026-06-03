import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { engineersApi, jobsApi, proposalsApi, contractsApi } from '@/lib/api'

// ─── Engineers ────────────────────────────────────────────────

export function useEngineers(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['engineers', filters],
    queryFn:  () => engineersApi.list(filters),
    staleTime: 30_000,
  })
}

export function useEngineer(id: string) {
  return useQuery({
    queryKey: ['engineer', id],
    queryFn:  () => engineersApi.get(id),
    enabled:  !!id,
  })
}

export function useMyEngineerProfile() {
  return useQuery({
    queryKey: ['engineer', 'me'],
    queryFn:  () => engineersApi.getMe(),
    retry:    false,
  })
}

export function useUpdateEngineerProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => engineersApi.updateProfile(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['engineer', 'me'] }),
  })
}

export function useAddSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => engineersApi.addSkill(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['engineer', 'me'] }),
  })
}

export function useRemoveSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (skillId: string) => engineersApi.removeSkill(skillId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['engineer', 'me'] }),
  })
}

export function useAddPortfolioItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => engineersApi.addPortfolio(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['engineer', 'me'] }),
  })
}

export function useAddCertification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => engineersApi.addCertification(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['engineer', 'me'] }),
  })
}

export function useAddEducation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => engineersApi.addEducation(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['engineer', 'me'] }),
  })
}

// ─── Jobs ─────────────────────────────────────────────────────

export function useJobs(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn:  () => jobsApi.list(filters),
    staleTime: 30_000,
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn:  () => jobsApi.get(id),
    enabled:  !!id,
  })
}

export function useMyJobs() {
  return useQuery({
    queryKey: ['jobs', 'mine'],
    queryFn:  () => jobsApi.myJobs(),
  })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => jobsApi.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

// ─── Proposals ────────────────────────────────────────────────

export function useMyProposals() {
  return useQuery({
    queryKey: ['proposals', 'mine'],
    queryFn:  () => proposalsApi.mine(),
  })
}

export function useJobProposals(jobId: string) {
  return useQuery({
    queryKey: ['proposals', 'job', jobId],
    queryFn:  () => proposalsApi.forJob(jobId),
    enabled:  !!jobId,
  })
}

export function useCreateProposal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => proposalsApi.create(data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['proposals'] })
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

// ─── Contracts ────────────────────────────────────────────────

export function useMyContracts() {
  return useQuery({
    queryKey: ['contracts', 'mine'],
    queryFn:  () => contractsApi.mine(),
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: ['contract', id],
    queryFn:  () => contractsApi.get(id),
    enabled:  !!id,
  })
}
