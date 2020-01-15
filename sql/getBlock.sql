SELECT n,pip,pep,per FROM block
WHERE block.n < (${block})
ORDER BY n DESC
LIMIT 1;
