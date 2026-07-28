import { LanguageRoot } from "#common/patterns/index";
import { NodeRegistry} from "#common/ast/node";
import { Pattern, PrimitivePattern, MatchSymbolPattern } from "#common/patterns/index";
import { ErrorDefinitionList } from "#common/ast/error"; 
import { warn } from "node:console";
import { IR } from "#common/ir/ir";
import { start } from "node:repl";


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

export class GeneratedFiles {
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

export function generate_parser_code(generator_context: GeneratorContext): GeneratedFiles {
  let name_list: Map<string,boolean> = new Map<string,boolean>();
  function get_unique_string_id(starting_string: string): string
  {
    let prefix_value = 0;
    while(name_list.has(starting_string + prefix_value))
    {
      prefix_value++;
    };

    name_list.set(starting_string + prefix_value,true);
    return starting_string + prefix_value;
  };
  
  let generated_files = new GeneratedFiles(generator_context);
  let generation_info = generated_files.generation_info;
  let hardened_symbols = generation_info.hardened_symbols;
  let symbol_map = generation_info.symbol_map;

  const visited_patterns = new Set<PrimitivePattern>();

  function walk_grammar_pattern(pattern: PrimitivePattern, current_language: LanguageRoot) {
    if (!pattern || visited_patterns.has(pattern)) return;
    visited_patterns.add(pattern);

    if (pattern.error_id !== undefined && pattern.error_id !== -1) {
      const used_flags = generation_info.used_error_codes.get(current_language);
      if (used_flags && pattern.error_id < used_flags.length) {
        used_flags[pattern.error_id] = true;
      }
    }

    if (pattern instanceof LanguageRoot)
    {
      for (const starting_pattern of generator_context.main_root.root.get_children()) {
        walk_grammar_pattern(starting_pattern, pattern);
      }
    }else if (pattern instanceof MatchSymbolPattern) {
      const literal = pattern.expected_symbol;

      // Handle Hardened Symbols
      if (pattern.is_hardset_symbol) {
        if (!hardened_symbols.includes(pattern)) {
          hardened_symbols.push(pattern);
        }
      }

      // Check for structural ambiguities (Same literal, different symbol labels)
      if (symbol_map.has(literal)) {
        const existing_pattern = symbol_map.get(literal)!;
        if (existing_pattern.symbol_label !== pattern.symbol_label) {
          warn(
            `Grammar Ambiguity Warning: The symbol text "${literal}" is registered under ` +
            `multiple labels: "${existing_pattern.symbol_label}" and "${pattern.symbol_label}".`
          );
        }
      } else {
        symbol_map.set(literal, pattern);
      }
    }
    else {
      const children = pattern.get_children();
      for (const child of children) {
        walk_grammar_pattern(child, current_language);
      }
    }
  }

  if (generator_context.main_root) {
    for (const starting_pattern of generator_context.main_root.root.get_children()) {
      walk_grammar_pattern(starting_pattern, generator_context.main_root);
    }
  }

  let all_errors_used = true;
  generation_info.used_error_codes.forEach((flags) => {
    if (flags.includes(false)) {
      all_errors_used = false;
    }
  });
  generation_info.not_all_error_codes_used = !all_errors_used;

  let header_ir: IR.IRRoot = generated_files.header_ir;

  header_ir.ir_group.insert_member(
    new IR.IRIncludeBlock()
    .add_include("<common/language_processing/parser.hpp>")
    .add_include("<common/language_processing/node_handle.hpp>")
    
    .add_include("nodes.hpp",true)
    .add_include("symbols.hpp",true)
    .add_include("error_codes.hpp",true)
  );

  let implementation_root: IR.IRRoot = generated_files.implementation_ir;

  let implementation_namespace: IR.IRNamespace = new IR.IRNamespace("Languages");

  implementation_root.ir_group.insert_member(
    implementation_namespace
  );

  const node_handle: IR.Type = new IR.Type().insert_type("NodeHandle");

  let pattern_to_ir_map = new Map<Pattern,IR.IRFunction>();

  visited_patterns.forEach((pattern: PrimitivePattern) => {
    if (pattern.constructor! == Pattern)
    {
      let ir_function = new IR.IRFunction(node_handle,get_unique_string_id(pattern.class_name));

      implementation_namespace.ir_group.insert_member(
        ir_function
      );

      pattern_to_ir_map.set(pattern as Pattern,ir_function);
    };
  });

  /* 
    Now start generating IR per pattern
    For nown I'll use only low level IR
  */

  function generate_ir()
  {
    //read patterns on the list
    //for each pattern generate function code   
    //(in implementation ir)

    //in header define node classes/errors and symbol enums per language
  };

  return generated_files;
}
