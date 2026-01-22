#pragma once
#include <cstdint>
#include <vector>
#include <lexer/lexer.hpp>

#include <keyword_classifier.hpp>
#include <DebuggerAssets/debugger/debugger.hpp>

#define NormalizerError "Normalizer Error: "
#define NormalizerErrorEnd "\n"

static_assert(std::is_same_v<Util::Token, Util::Token>, "NOT THE SAME TYPE");
namespace AST{
    enum class NormalErrorCode{
        None,
    };

    /*
        Vague Normal Token Type is a helper enum
        for guess_token_type, to help determine how to consume the 
        token by type properly. There are some indications that the token is a number, 
        but the token normalizer must further down specify which number type: float/int...
        
        Same goes for identifiers...
    */
    enum class VagueNormalTokenType {
        Error,
        Number,
        Identifier,
        StringLiteral,
        Symbol,
        CommentBlock,
        EOFToken,
    };

    enum class NormalTokenType {
        Error,
        Number,
        KeywordIdentifier, LiteralIdentifier,
        StringLiteral,
        Symbol,
        CommentBlock,
        EOFToken,
    };

    struct NormalError {
        NormalErrorCode error_code = NormalErrorCode::None;
        size_t index = 0;
    };

    struct NormalToken {
        NormalTokenType token_type = NormalTokenType::Error;
        size_t length = 0;
        size_t offset = 0;
    };  

    /*
        Token Normalizer is language aware at some point.
        It detects basic expressions like comments and distinguishes number literals from each other.
    */

    class TokenStreamReader {   
        static inline Util::Token EOF_TOKEN = (Util::Token)[](){
            Util::Token TOKEN = Util::Token();
            TOKEN.token_type = Util::TokenType::EndOfFile;
            return TOKEN;
        }();

        Util::Lexer& lexer;
        std::vector<Util::Token> token_stream;

        public:
        size_t index;
        
        TokenStreamReader() = default;
        TokenStreamReader(Util::Lexer& lexer): lexer(lexer)
        {
            auto next_token = lexer.get_next_token();
            while (next_token.token_type != Util::TokenType::EndOfFile)
            {
                token_stream.push_back(next_token);
                if (next_token.token_type == Util::TokenType::Error)
                {
                    std::cout << "unexpected token type, can't process that stream further (Error)" << std::endl;
                    break;
                };
            };
        };

        inline bool can_consume()
        {
            return index < token_stream.size();
        };  

        inline void consume()
        {
            Assert(
                can_consume(),
                NormalizerError
                "Can't consume more lexer tokens"
                NormalizerErrorEnd
            );
            index++;
        };

        inline Util::Token see_current()
        {
            if (!can_consume())
            {
                return EOF_TOKEN;
            };
            return token_stream[index];
        };

        inline bool can_peek(size_t peek_distance = 1) const noexcept
        {
           return index+peek_distance < token_stream.size();
        };

        inline Util::Token peek(size_t peek_distance = 1)
        {   
            if (!can_peek())
            {
                return EOF_TOKEN;
            };
            return token_stream[index+peek_distance];
        };
    };

    class NormalTokenStreamContext {
        Util::Lexer lexer;
        public:
        TokenStreamReader token_stream_reader;

        std::vector<NormalError> errors;

        VagueNormalTokenType original_token_type;
        NormalTokenType ultimate_token_type;

        NormalTokenStreamContext(Util::Source& source): lexer(source), token_stream_reader(lexer)
        {};  

        void emit_error(NormalErrorCode error_code)
        {
            NormalError error;
            error.error_code = error_code;
            error.index = token_stream_reader.index;
            errors.push_back(error);

            ultimate_token_type = NormalTokenType::Error;
        };
    };

    class NormalTokenStream {

        NormalTokenStreamContext normal_token_stream_context;

        public:
        NormalTokenStream(Util::Source& source): normal_token_stream_context(source)
        {};  

        NormalToken get_next_token();
    };
}