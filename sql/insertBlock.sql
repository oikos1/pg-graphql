INSERT INTO block (
  n,
  time,
  pip,
  pep,
  per
)
VALUES (
  ${n},
  to_timestamp(${time}/1000),
  $(pip),
  $(pep),
  $(per)
)
ON CONFLICT (n)
DO UPDATE
SET
pip = ${pip},
pep = ${pep},
per = ${per}
