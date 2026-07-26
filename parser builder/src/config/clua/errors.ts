import { enumerate_enum} from "#root/common/ast/error";

export enum ErrorTypes {
    None,
    ExpectedKeyword,
    ExpectedIdentifier,
    UnknownStatement,
    ExpectedCloseParen,
    ExpectedOpenParen,
    ExpectedWhitespace,
    ExpectedCommentStart,
    ExpectedCommentEnd,
    ExpectedNewline,
    ExpectedStringClosure
};

export let error_values_array = enumerate_enum(ErrorTypes);