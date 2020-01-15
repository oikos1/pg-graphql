SELECT n 
FROM public.block
WHERE public.block.n < ${block}
LIMIT 1;