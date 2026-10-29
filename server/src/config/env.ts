import 'dotenv/config';
import { z } from 'zod';

/**
 * Validates and parses all environment variables at startup.
 * In demo mode, uses fallback values so the server can run without real credentials.
 */
const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL').default('https://demo.supabase.co'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required').default('demo-anon-key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required').default('demo-service-key'),

  // Gemini
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required').default('demo-gemini-key'),

  // Server
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),   // 15 min
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Demo Mode
  DEMO_MODE: z.preprocess((val) => {
    if (val === 'false' || val === false || val === '0') return false;
    if (val === 'true' || val === true || val === '1') return true;
    return false;
  }, z.boolean()).default(false),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`   ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  if (result.data.DEMO_MODE) {
    console.log('⚠️  Running in DEMO MODE — auth and Gemini use mock services');
  }

  return result.data;
}

export const env = loadEnv();
