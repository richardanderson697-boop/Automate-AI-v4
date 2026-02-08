-- Create vector similarity search function for RAG
create or replace function match_repair_knowledge (
  query_embedding vector(768),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  title text,
  content text,
  category text,
  similarity float
)
language sql stable
as $$
  select
    id,
    title,
    content,
    category,
    1 - (embedding <=> query_embedding) as similarity
  from repair_knowledge
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
