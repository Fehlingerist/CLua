#include <token_normalizer.hpp>

namespace AST {


    void consume_string_token(NormalTokenStreamContext& normal_token_stream_context)
    {

    };

    void consume_number_token(NormalTokenStreamContext& normal_token_stream_context)
    {

    };

    void consume_comment_block(NormalTokenStreamContext& normal_token_steam_context)
    {
        
    };

    void consume_identifier_token(NormalTokenStreamContext& normal_token_stream_context)
    {

    };

    void make_eof_token(NormalTokenStreamContext& normal_token_steam_context)
    {

    };

    void consume_symbol(NormalTokenStreamContext& normal_token_stream_context)
    {

    };

    void error_token()
    {

    };

    VagueNormalTokenType guess_token_type(NormalTokenStreamContext& normal_token_stream_context)
    {
        
    };

    NormalToken NormalTokenStream::get_next_token()
    {
        auto type = guess_token_type(normal_token_stream_context);

        size_t token_start = normal_token_stream_context.token_stream_reader.index;

        normal_token_stream_context.original_token_type = type;

        switch (type) {
            case VagueNormalTokenType::StringLiteral: consume_string_token(normal_token_stream_context); break;
            case VagueNormalTokenType::Number: consume_number_token(normal_token_stream_context); break;
            case VagueNormalTokenType::CommentBlock: consume_comment_block(normal_token_stream_context); break;
            case VagueNormalTokenType::EOFToken: make_eof_token(normal_token_stream_context); break; 
            case VagueNormalTokenType::Symbol: consume_symbol(normal_token_stream_context); break;
            case VagueNormalTokenType::Identifier: consume_identifier_token(normal_token_stream_context); break;
            default: error_token(); break;
        }
        
        size_t token_end = normal_token_stream_context.token_stream_reader.index;

        NormalToken token;
        token.token_type = normal_token_stream_context.ultimate_token_type;
        token.offset = token_start;
        token.length = token_end - token_start;

        return token;
    }
}