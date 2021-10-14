TODO: Link to tests/README.md


1. web/cron: Receive request to create test
2. web/cron: Create an entry in PG (register test in progress) - returning TestID
3. web/cron: Schedule onto TestQueue, pass TestID
4. TestRunner: schedules individual tests, passing in TestID
5. TestWorker: schedules results onto ResultQueue, passing TestID
6. ResultWorker: worker moves results into postgres
