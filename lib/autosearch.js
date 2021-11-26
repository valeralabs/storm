import Search from 'search-array'

export async function autosearch(input, choices) {
  const engine = new Search(choices)
  return engine.query(input)
}
