import { LanguageRoot, Pattern } from "#common/patterns/index";
import { NodeRegistry} from "#common/ast/node";
import { PatternType, MatchSymbolPattern, ChoicePattern } from "#common/patterns/index";
import { ErrorDefinitionList } from "#common/ast/error"; 
import { IR } from "#common/ir/ir";
import util from "node:util";

/* 
    Generator converts patterns into a mega parser file.

    Generator disambiguates programming languages with help 
    of grammar specification language, it determines to which language 
    does the symbol belong to and warns about ambiguities in the language.

    Later it should resolve at which points do the patterns stop overlapping.
*/

export class GeneratorContext {
  main_root: LanguageRoot;
  node_definitions: Map<LanguageRoot,NodeRegistry>;
  error_definition_list: Map<LanguageRoot,ErrorDefinitionList>;

  constructor(root: LanguageRoot)
  {
    this.main_root = root;
    this.node_definitions = new Map<LanguageRoot,NodeRegistry>();
    this.error_definition_list = new Map<LanguageRoot,ErrorDefinitionList>();
  };

  set_node_definition(language: LanguageRoot,node_definitions: NodeRegistry): this
  {
    this.node_definitions.set(language,node_definitions);
    return this;
  };

  set_error_definition(language: LanguageRoot,error_definition_list: ErrorDefinitionList): this
  {
    this.error_definition_list.set(language,error_definition_list);
    return this;
  };
};

export class GenerationInfo {
  hardened_symbols: Array<MatchSymbolPattern> = new Array<MatchSymbolPattern>();
  symbol_map: Map<string,MatchSymbolPattern> = new Map<string,MatchSymbolPattern>();

  error_codes: Map<LanguageRoot, ErrorDefinitionList>;
  used_error_codes: Map<LanguageRoot,Array<boolean>>;

  not_all_error_codes_used: boolean = true;

  constructor(generator_context: GeneratorContext)
  { 
    this.error_codes = generator_context.error_definition_list;
    this.used_error_codes = new Map<LanguageRoot,Array<boolean>>();
    this.error_codes.forEach((value,key) => {
      this.used_error_codes
      .set(key,new Array<boolean>(value.length)
      .fill(false))
    });
  };

  display_info()
  {
    console.log(this);
  };
};

export class ParserIR {
  generation_info: GenerationInfo

  header_ir: IR.IRRoot;
  implementation_ir: IR.IRRoot;

  constructor(generator_context: GeneratorContext)
  {
    this.generation_info = new GenerationInfo(generator_context);

    this.header_ir = new IR.IRRoot();
    this.implementation_ir = new IR.IRRoot();
  };
};

export class PatternConflictResolution {

};

export class PatternConflictContext {
  constructor(
    public patterna: PatternType,
    public patternb: PatternType
  ){}

  pattern_conflict_resolution: PatternConflictResolution = new PatternConflictResolution();
};

class LanguageAnalysisContext {
  pattern_conflicts: Array<PatternConflictContext>;
  flattened_decision_tree: Array<PatternType>;

  constructor(public generator_context: GeneratorContext)
  {
    this.pattern_conflicts = new Array<PatternConflictContext>();
    this.flattened_decision_tree = new Array<PatternType>();
  };

  analyze_language()
  {
    /* 
      -Find potential pattern conflicts
      {
        My guess here is that I generate an array of all posibilities of order of the pattern, 
        but I must account for recursion via some abtract class and this will probably the main 
        problem to solve.

        After generation of the linear arrays I try to look for overlaps and mark them as conflicts to resolve.
        Also these patterns should be flattened from patterns to the their rawest form leaving almost no abstraction.
        In this case InvertedPattern must be preserved, QuantityPattern, ChoicePattern
      }
      
      -Generate pattern conflict resolutions if conflicts do exist 
      
      -Analyze if all error codes have been used
      
      -Analyze how node maps to pattern field initialization so
      that the read fields can be reused to be assigned to node field.
    */
    const grammar_description_root = this.generator_context.main_root; 
    let met_patterns: Set<PatternType> = new Set<PatternType>();
    let recursive_patterns: Set<PatternType> = new Set<PatternType>();
    
    function traverse_and_flatten(
      current_node: PatternType,
      traverse_history: Array<PatternType> = [],
      flattened_array: Array<PatternType> = []
    ): Array<PatternType> {
      flattened_array = [...flattened_array]; 
      //I am going to make a lot of copies but I guess it won't crash on most of the 
      //machines

      if (traverse_history.includes(current_node)) {
        recursive_patterns.add(current_node);
        flattened_array.push(current_node); 
        return flattened_array;
      }

      met_patterns.add(current_node);
      const updated_history = [...traverse_history, current_node];

      const children = current_node.get_children();

      if (!children || children.length === 0) {
        flattened_array.push(current_node);
        return flattened_array;
      }

      if (current_node.constructor == ChoicePattern) {
        for (const child of children) {
          traverse_and_flatten(child, updated_history, flattened_array);
        }
        return flattened_array;
      } else if (current_node.constructor == Pattern)
      {
        for (const child of children) {
          traverse_and_flatten(child, updated_history, flattened_array);
        }
      };

      return flattened_array;
    }
    let result: Array<PatternType> = traverse_and_flatten(
                grammar_description_root,
                [grammar_description_root] as Array<PatternType>);

    console.log(util.inspect(result, { 
      depth: null,       // Prevents replacing deep arrays/objects with [Array] or [Object]
      colors: true,      // Keeps terminal syntax highlighting clean
      maxArrayLength: null // Prints ALL array items, no matter how long the array is
    }));
  };
};

export function transpile_ir_to_code(ir: IR.IRRoot)
{

};

export function generate_parser_ir(language_analysis_context: LanguageAnalysisContext): ParserIR | void
{

};

export function get_language_analysis(generator_context: GeneratorContext): LanguageAnalysisContext{
  let language_analysis_context = new LanguageAnalysisContext(generator_context); 
  language_analysis_context.analyze_language();
  return language_analysis_context;
}
