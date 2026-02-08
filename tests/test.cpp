#include <lexer/lexer.hpp>

#include <iostream>
#include <string>
#include <cassert>

template<size_t TokenCount>
struct Test {
    const char* name;
    const char* input;
    Util::TokenType expected_types[TokenCount];
    size_t expected_offsets[TokenCount];
    size_t expected_lengths[TokenCount];
    bool expect_error = false;
    Util::ErrorCode expected_error;
};

template<size_t TokenCount>
void run_test(const Test<TokenCount>& test)
{
    std::cout << "[TEST] " << test.name << std::endl;

    Util::Source source(
        reinterpret_cast<unsigned char*>(const_cast<char*>(test.input)),
        std::strlen(test.input)
    );

    Util::Lexer lexer(source);

    for (size_t i = 0; i < TokenCount; ++i)
    {
        auto token = lexer.process_next_token();

        assert(token.token_type == test.expected_types[i]);
        assert(token.offset == test.expected_offsets[i]);
        assert(token.length == test.expected_lengths[i]);
    }

    if (test.expect_error)
    {
        assert(lexer.get_last_error().error_code == test.expected_error);
    }

    std::cout << "  OK\n";
}

int main()
{
    Test<2> IDENTIFIER_ONLY {
        "identifier only",
        "wdadwad122e312",
        {
            Util::TokenType::Identifier,
            Util::TokenType::EndOfFile
        },
        { 0, 15 },
        { 15, 0 }
    };

    Test<4> IDENTIFIER_WHITESPACE_IDENTIFIER {
        "identifier whitespace identifier",
        "foo bar",
        {
            Util::TokenType::Identifier,
            Util::TokenType::Whitespace,
            Util::TokenType::Identifier,
            Util::TokenType::EndOfFile
        },
        { 0, 3, 4, 7 },
        { 3, 1, 3, 0 }
    };

    Test<6> NUMBERS {
        "decimal hex binary",
        "12 0xFF 0b101",
        {
            Util::TokenType::Numeric,
            Util::TokenType::Whitespace,
            Util::TokenType::Numeric,
            Util::TokenType::Whitespace,
            Util::TokenType::Numeric,
            Util::TokenType::EndOfFile
        },
        { 0, 2, 3, 7, 8, 13 },
        { 2, 1, 4, 1, 5, 0 }
    };

    Test<2> MULTI_WHITESPACE {
        "multi whitespace",
        " \t  ",
        {
            Util::TokenType::Whitespace,
            Util::TokenType::EndOfFile
        },
        { 0, 4 },
        { 4, 0 }
    };

    Test<2> INLINE_COMMENT {
        "inline comment",
        "// hello world\n",
        {
            Util::TokenType::Comment,
            Util::TokenType::EndOfFile
        },
        { 0, 15 },
        { 15, 0 }
    };

    Test<2> UNCLOSED_BLOCK_COMMENT {
        "unclosed block comment",
        "wdadwad122e312 /* dasd adwa",
        {
            Util::TokenType::Identifier,
            Util::TokenType::Error
        },
        { 0, 15 },
        { 15, 0 },
        true,
        Util::ErrorCode::UnclosedComment
    };

    run_test(IDENTIFIER_ONLY);
    run_test(IDENTIFIER_WHITESPACE_IDENTIFIER);
    run_test(NUMBERS);
    run_test(MULTI_WHITESPACE);
    run_test(INLINE_COMMENT);
    run_test(UNCLOSED_BLOCK_COMMENT);

    std::cout << "\nAll lexer tests passed.\n";
    return 0;
}