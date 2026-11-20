import { createClient } from '@supabase/supabase-js'

const url = 'https://atjdorofafwqscarrjml.supabase.co/rest/v1/'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0amRvcm9mYWZ3cXNjYXJyam1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4MjcwNDAsImV4cCI6MjExMDQwMzA0MH0.XpN7uxJb1wdUxluHS4rdgxuQDMiby8CDeRp1ZCtKu6E'

export const supabase = createClient(url, key)
