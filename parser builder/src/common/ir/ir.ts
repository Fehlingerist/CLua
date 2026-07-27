import {
   PatternYieldType,
   PrimitivePattern,
   Pattern,
   ChoicePattern,
   InvertedPattern,
   QuantityPattern,
   CharRange,
   CaptureLengthPattern,
   MatchSymbolPattern,
   Conversion
} from "#common/patterns/index";
import * as Nodes from "#common/ast/node";

export namespace IR {
   export abstract class BaseIR {}

   export class IRRoot extends BaseIR {
      public ir_group: IRGroup;
      
      constructor() {
         super();
         this.ir_group = new IRGroup();
      }
   }

   export class IRGroup {
      private members: BaseIR[] = [];

      public insert_member(member: BaseIR): void {
         this.members.push(member);
      }

      public remove_member(member: BaseIR): void {
         const index = this.members.indexOf(member);
         if (index !== -1) {
            this.members.splice(index, 1);
         }
      }

      public remove_member_at(index: number): boolean {
         if (index >= 0 && index < this.members.length) {
            this.members.splice(index, 1);
            return true;
         }
         return false;
      }

      public get_members(): BaseIR[] {
         return this.members;
      }
   }

   export class Type {
      public types: Array<string>;
      
      constructor() {
         this.types = new Array<string>();
      }

      public insert_type(type: string): this {
         this.types.push(type);
         return this;
      }

      public emit(): string {
         return this.types.join("::");
      }
   }

   export class IRIncludeBlock extends BaseIR {
      public includes: Array<{ path: string; is_local: boolean }>;

      constructor() {
         super();
         this.includes = new Array<{ path: string; is_local: boolean }>();
      }

      public add_include(include_path: string, is_local?: boolean): this {
         let clean_path = include_path.trim();
         let local_determined = is_local;

         if (local_determined === undefined) {
            if (clean_path.startsWith('<') && clean_path.endsWith('>')) {
               local_determined = false;
               clean_path = clean_path.slice(1, -1);
            } else if (clean_path.startsWith('"') && clean_path.endsWith('"')) {
               local_determined = true;
               clean_path = clean_path.slice(1, -1);
            } else {
               local_determined = true;
            }
         }

         this.includes.push({ path: clean_path, is_local: local_determined });
         return this;
      }

      public emit_includes(): string[] {
         return this.includes.map(inc => 
            inc.is_local ? `"${inc.path}"` : `<${inc.path}>`
         );
      }
   }

   export class IRNamespace extends BaseIR {
      public ir_group: IRGroup;

      constructor(public namespace: string) {
         super();
         this.ir_group = new IRGroup();
      }
   }

   export class IRFunction extends BaseIR {
      constructor(
         public return_type: Type,
         public identifier: string
      ) {
         super();
      }
   }
}
