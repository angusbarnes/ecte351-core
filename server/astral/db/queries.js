const queries = {};

export function GetQuery(query_name) {
  if (query_name in queries) return queries[query_name];

  const queryFiles = fs.readdirSync("./../data/queries");

  for (const queryFile of queryFiles) {
    const queryName = path.parse(queryFile).name;
    const queryPath = path.join("./../data/queries", queryFile);
    const query = fs.readFileSync(queryPath, 'utf-8');
  }
}