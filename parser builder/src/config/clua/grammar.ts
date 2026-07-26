import { ErrorTypes } from "./errors";
import { NodeID} from "./nodes_declare";
import { CharRange,LengthContext,ChoicePattern,MatchContextLengthPattern,CaptureLengthPattern,Pattern,InvertedPattern,LanguageRoot } from "#common/patterns/index"; 
import { QuantityPattern } from "#root/common/patterns/logic";
import { MatchSymbolPattern } from "#root/common/patterns/primitives";

// ============================================================================
// 1. Primitive Tokens & Lexical Helpers
// ============================================================================

export const SpaceChar = new CharRange().insert_range(" ", " ");
export const OptionalWhitespace = new QuantityPattern(SpaceChar, 0, -1);
export const RequiredWhitespace = new QuantityPattern(SpaceChar, 1, -1);

export const AlphaUnder = new CharRange()
    .insert_range("a", "z")
    .insert_range("A", "Z")
    .insert_range("_", "_");

export const Digit = new CharRange().insert_range("0", "9");

export const AlnumUnder = new CharRange()
    .insert_range_def(AlphaUnder)
    .insert_range_def(Digit);

export const IdentifierRest = new QuantityPattern(AlnumUnder, 0, -1);

// ============================================================================
// 2. Terminating Symbol Primitives
// ============================================================================

export const CommentStart = new MatchSymbolPattern("--", "COMMENT_START");
export const NewLineChar = new MatchSymbolPattern("\n", "NEWLINE");
export const QuoteChar = new MatchSymbolPattern('"', "QUOTE");
export const ClosingString = QuoteChar.with_error(ErrorTypes.ExpectedStringClosure);

export const LongCommentLengthCtx = new LengthContext();
export const LongCommentOpenBracket = new MatchSymbolPattern("[", "OPEN_BRACKET");
export const LongCommentCloseBracket = new MatchSymbolPattern("]", "CLOSE_BRACKET");
export const EqualSign = new MatchSymbolPattern("=", "EQUAL_SIGN");

export const CaptureEquals = new CaptureLengthPattern(
    new QuantityPattern(EqualSign, 0, -1), 
    LongCommentLengthCtx
);

export const MatchEquals = new MatchContextLengthPattern(
    new QuantityPattern(EqualSign, 0, -1),
    LongCommentLengthCtx
);

// ============================================================================
// 3. Grammar Syntactic Constructs
// ============================================================================

export const GenericIdentifier = new Pattern()
    .insert_pattern(AlphaUnder)
    .insert_pattern(IdentifierRest)
    .yields_node(NodeID.Identifier) 
    .set_pattern_name("GenericIdentifier");

export const CommentContent = new InvertedPattern()
    .insert_terminator(NewLineChar)
    .set_pattern_name("CommentContent");

export const LineComment = new Pattern()
    .insert_pattern(OptionalWhitespace)
    .insert_pattern(CommentStart)
    .insert_pattern(CommentContent)
    .insert_pattern(NewLineChar)
    .yields_node(NodeID.Comment)
    .set_pattern_name("LineComment");

export const StringContent = new Pattern()
    .insert_pattern(
        new InvertedPattern()
            .insert_terminator(ClosingString) 
            .set_inclusive(false)  
            .set_pattern_name("StringContent")
    ).set_pattern_name("StringPrimitive"); 

export const StringLiteral = new Pattern()
    .insert_pattern(QuoteChar)
    .insert_pattern(StringContent)
    .insert_pattern(ClosingString)
    .yields_node(NodeID.StringLiteral)
    .set_pattern_name("StringLiteral");

export const LongCommentStart = new Pattern()
    .insert_pattern(new MatchSymbolPattern("--", "COMMENT_START"))
    .insert_pattern(LongCommentOpenBracket)
    .insert_pattern(CaptureEquals)
    .insert_pattern(LongCommentOpenBracket)
    .with_error(ErrorTypes.ExpectedCommentStart)
    .set_pattern_name("LongCommentStart");

export const LongCommentEnd = new Pattern()
    .insert_pattern(LongCommentCloseBracket)
    .insert_pattern(MatchEquals)
    .insert_pattern(LongCommentCloseBracket)
    .with_error(ErrorTypes.ExpectedCommentEnd)
    .set_pattern_name("LongCommentEnd");

export const LongCommentContent = new InvertedPattern()
    .insert_terminator(LongCommentEnd)
    .set_inclusive(false)
    .set_pattern_name("LongCommentContent");

export const NumberLiteral = new Pattern()
    .insert_pattern(
        new QuantityPattern(Digit, 1, 10)
    );

export const Expression = new Pattern()
    .insert_pattern(OptionalWhitespace)
    .insert_pattern(
        new ChoicePattern()
            .insert_pattern(StringLiteral)
            .insert_pattern(NumberLiteral)
            .insert_pattern(GenericIdentifier)
    )
    .set_pattern_name("Expression");

export const LocalKeyword = new MatchSymbolPattern("local", "KEYWORD")
    .harden()
    .with_error(ErrorTypes.ExpectedKeyword);

export const LocalDeclaration = new Pattern()
    .insert_pattern(LocalKeyword)
    .insert_pattern(RequiredWhitespace)
    .insert_pattern(GenericIdentifier)
    .yields_node(NodeID.LocalDeclaration)
    .set_pattern_name("LocalDeclaration");

export const ArgumentList = new ChoicePattern()
    .insert_pattern(Expression)
    .insert_pattern(
        new Pattern()
            .insert_pattern(new QuantityPattern(
                new Pattern()
                    .insert_pattern(Expression)
                    .insert_pattern(new MatchSymbolPattern(",")),
                1, -1
            ))
            .insert_pattern(Expression)
    );

export const FunctionCall = new Pattern()
    .insert_pattern(GenericIdentifier)
    .insert_pattern(OptionalWhitespace)
    .insert_pattern(new MatchSymbolPattern("(", "OPEN_PAREN").with_error(ErrorTypes.ExpectedOpenParen))
    .insert_pattern(ArgumentList)
    .insert_pattern(new MatchSymbolPattern(")", "CLOSE_PAREN").with_error(ErrorTypes.ExpectedCloseParen))
    .yields_node(NodeID.FunctionCall)
    .set_pattern_name("FunctionCall");

export const StatementParser = new ChoicePattern()
    .insert_pattern(LocalDeclaration)
    .insert_pattern(FunctionCall)
    .set_pattern_name("StatementParser");

export const Trivia = new ChoicePattern()
    .insert_pattern(LineComment);

export const LanguageExpressionUnit = new ChoicePattern()
    .insert_pattern(Trivia)
    .insert_pattern(StatementParser);

export const SourceRoot = new QuantityPattern(LanguageExpressionUnit, 0, -1)
    .set_pattern_name("SourceRoot");

export const EntryPattern = new Pattern()
    .insert_pattern(SourceRoot)
    .yields_node(NodeID.Root)
    .set_pattern_name("Root");

// ============================================================================
// 4. Modern Pipeline Bounding: LanguageRoot & GeneratorContext Integration
// ============================================================================

/**
 * Encapsulate the entire grammar under a clean, explicit boundary.
 */
export const ScriptLanguageRoot = new LanguageRoot("LuaScript")
    .set_root(EntryPattern);
