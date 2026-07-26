import {
   PatternYieldType,
   PrimitivePattern,
   Pattern,
   ChoicePattern,
   InvertedPattern,
   QuantityPattern,
   CharRange,
   CaptureLengthPattern,
   MatchSymbolPattern} from "#common/patterns/index";
import * as Nodes from "#common/ast/node";
import { Conversion } from "../patterns";

export namespace LowIR {
   /* 
   IR patterns in the example parser
   */
};

export namespace HighIR {
   /* 
    CaptureLengthPattern, MatchContextLengthPattern, //extension of quantity pattern
    --Length capture context
    
    PatternSwitchParser,

    NodeConversion, SpanConversion, NodeChainConversion, //converted into properties 
    
    ChoicePattern, InvertedPattern, Pattern, QuantityPattern,
    CharRange, MatchSymbolPattern
   */

   abstract class HIRBase {
      convert_to: PatternYieldType
      attached_pattern: PrimitivePattern

      constructor(pattern: PrimitivePattern)
      {
         this.attached_pattern = pattern;
         this.convert_to = PatternYieldType.None;//code for inferring type from pattern
      };

      abstract convert_emit_type(pattern_emit_type: PatternYieldType): void;

      get_pattern_type()
      {
         if (this.convert_to != PatternYieldType.None)
         {
            return this.convert_to;
         };

         return this.attached_pattern.get_yield_type();
      };
   };

   export class HIRSequence extends HIRBase {
      symbol_token: number = -1;

      constructor(pattern: PrimitivePattern)
      {
         super(pattern);
      };    

      convert_emit_type(pattern_emit_type: PatternYieldType): void {
         if (
            pattern_emit_type != PatternYieldType.Symbol && 
            pattern_emit_type != PatternYieldType.TokenSpanNode &&
            pattern_emit_type != PatternYieldType.None
         ){
            throw new Error(
               "The only valid emittable type is Symbol or TokenSpanNode for sequence pattern"
            );
         };
         this.convert_to = pattern_emit_type;
      };

      set_symbol_token(new_symbol_token: number)
      {
         this.symbol_token = new_symbol_token;
      };
   }
   export class HIRChoice extends HIRBase {
      constructor(pattern: PrimitivePattern)
      {
         super(pattern);
      };

      //Rules of HIRChoice
      //Can be converted to anything but all patterns must be convertable
      convert_emit_type(pattern_emit_type: PatternYieldType): void {
         
      };
   }
   export class HIRInverted extends HIRBase {
      constructor(pattern: PrimitivePattern)
      {
         super(pattern);
      };
      
      convert_emit_type(pattern_emit_type: PatternYieldType): void {
      
      }
   }
   export class HIRQuantity extends HIRBase {
      constructor(pattern: PrimitivePattern)
      {
         super(pattern);
      };
      
      convert_emit_type(pattern_emit_type: PatternYieldType): void {
      
      }
   }
   export class HIRCharRange extends HIRBase {
      constructor(pattern: PrimitivePattern)
      {
         super(pattern);
      };
      
      convert_emit_type(pattern_emit_type: PatternYieldType): void {
      
      }
   }
   export class HIRMatchSymbol extends HIRBase {
      constructor(pattern: PrimitivePattern)
      {
         super(pattern);
      };
      
      convert_emit_type(pattern_emit_type: PatternYieldType): void {
      
      }
   }
   export class HIRCaptureLength extends HIRBase {
      constructor(pattern: PrimitivePattern)
      {
         super(pattern);
      };
      
      convert_emit_type(pattern_emit_type: PatternYieldType): void {
      
      }
   }

   export function convert_pattern_to_hir(pattern: PrimitivePattern): HIRBase {
      const is_converter = pattern instanceof Conversion;
      let convert_type: PatternYieldType = PatternYieldType.None;

      if (is_converter) {
            let candidate = pattern.get_children()[0]; // conversion implicitly holds only 1 pattern member

            if (!candidate) {
               throw new Error("Invalid conversion");
            }

            convert_type = (pattern as Conversion).get_yield_type();
            pattern = candidate;
      }

      let hir_node: HIRBase;

      switch (true) {
            case pattern instanceof Pattern: {
               hir_node = new HIRSequence(pattern);
               break;
            }
            case pattern instanceof ChoicePattern: {
               hir_node = new HIRChoice(pattern);
               break;
            }
            case pattern instanceof InvertedPattern: {
               hir_node = new HIRInverted(pattern);
               break;
            }
            case pattern instanceof QuantityPattern: {
               hir_node = new HIRQuantity(pattern);
               break;
            }
            case pattern instanceof CharRange: {
               hir_node = new HIRCharRange(pattern);
               break;
            }
            case pattern instanceof MatchSymbolPattern: {
               hir_node = new HIRMatchSymbol(pattern);
               break;
            }
            case pattern instanceof CaptureLengthPattern: {
               hir_node = new HIRCaptureLength(pattern);
               break;
            }
            default: {
               throw new Error(
                  `Unexpected type of pattern given: ${pattern.constructor.name} Debug name: ${(pattern as any).class_name}`
               );
            }
      }

      if (convert_type !== PatternYieldType.None) {
            hir_node.convert_emit_type(convert_type);
      }

      return hir_node;
   }

   function lower_to_lir()
   {

   };
};