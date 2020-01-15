SELECT n,pip, pep, per FROM block
WHERE block.n < ${block} 
AND pip > 0 
AND pep > 0 
AND per > 0
ORDER BY n DESC
LIMIT ${limit};
