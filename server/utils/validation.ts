import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  password: z.string().min(6).max(128),
})

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export const conversationCreateSchema = z.object({
  title: z.string().max(200).optional(),
  system_prompt: z.string().max(10000).nullish(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  model_config_id: z.string().nullish(),
})

export const conversationUpdateSchema = z.object({
  title: z.string().max(200).optional(),
  system_prompt: z.string().max(10000).nullish(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  model_config_id: z.string().nullish(),
})

export const messageCreateSchema = z.object({
  conversation_id: z.string(),
  parent_id: z.string().nullish(),
  content: z.string().min(1).max(100000),
  role: z.enum(['user', 'system']).default('user'),
})

export const messageEditSchema = z.object({
  content: z.string().min(1).max(100000),
})

export const chatCompletionSchema = z.object({
  conversation_id: z.string(),
  parent_id: z.string().nullable(),
  model_config_id: z.string().optional(),
})

export const modelConfigCreateSchema = z.object({
  provider_id: z.string(),
  name: z.string().min(1).max(100),
  model_name: z.string().min(1).max(100),
  is_default: z.boolean().optional(),
})

export const modelConfigUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  model_name: z.string().min(1).max(100).optional(),
  is_default: z.boolean().optional(),
})

export const providerCreateSchema = z.object({
  name: z.string().min(1).max(100),
  api_endpoint: z.string().url(),
  api_key: z.string().optional(),
})

export const providerUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  api_endpoint: z.string().url().optional(),
  api_key: z.string().optional(),
})

export const modelsBulkEnableSchema = z.object({
  provider_id: z.string(),
  models: z.array(z.object({
    model_name: z.string().min(1).max(200),
    name: z.string().min(1).max(200).optional(),
  })).min(1),
})
