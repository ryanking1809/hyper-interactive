import nearley from 'nearley'
import grammar from './grammar'

export const parseFormula = (string) => {
  const parser = new nearley.Parser(
		nearley.Grammar.fromCompiled(grammar)
  );
  try {
      parser.feed(string)
      return parser.results[0]
    } catch (err) {
      console.error("Error at character " + err?.offset, err); // "Error at character 9"
      return 'error'
    }
}
