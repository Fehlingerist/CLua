#include "parser.hpp"

namespace ASTParser{
    using namespace SymbolClassifier;

    using TokenType = Util::TokenType;
    using NumberBase = Util::NumberBase;

    bool is_math_symbol_operator(SymbolKind symbol_kind)
    {

    };

    double eval_numeric_token_bin_base(ParserContext& parser_context)
    {
        auto& lexer = parser_context.get_lexer();
        auto& lexer_context = lexer.get_lexer_context();
        auto current_token = parser_context.see_current_token();
        auto source_slice = lexer_context.source.slice(current_token.offset,current_token.length);

        source_slice.consume(2); //0x
        auto current_char = source_slice.see_current();
        
        double number_val = 0;

        while (current_char != '\0')
        {
            Assert(
                    Util::TypeClassificator::is_bin_code(current_char),
                    ParserError + 
                    "invalid binary number code, Lexer failed to validate bin code"s + 
                    ParserErrorEnd
            )

            unsigned int digit_value = current_char - '0';

            source_slice.consume();
            current_char = source_slice.see_current();
            number_val *= 2;
            number_val += digit_value;
        };

        return number_val;
    };

    double eval_numeric_token_hex_base(ParserContext& parser_context)
    {
        auto& lexer = parser_context.get_lexer();
        auto& lexer_context = lexer.get_lexer_context();
        auto current_token = parser_context.see_current_token();
        auto source_slice = lexer_context.source.slice(current_token.offset,current_token.length);

        source_slice.consume(2); //0x
        auto current_char = source_slice.see_current();
        
        double number_val = 0;

        while (current_char != '\0')
        {
            Assert(
                    Util::TypeClassificator::is_hex_code(current_char),
                    ParserError + 
                    "invalid binary number code, Lexer failed to validate bin code"s + 
                    ParserErrorEnd
            )

            unsigned int digit_value = 0;

            if (Util::TypeClassificator::is_numeric_char(current_char))
            {
                digit_value = current_char - '0';
            } else{
                if (current_char >= 'a')
                {
                    digit_value = current_char - 'a';
                } else{
                    digit_value = current_char - 'A';
                };
                digit_value += 10;
            };

            source_slice.consume();
            current_char = source_slice.see_current();
            number_val *= 16;
            number_val += digit_value;
        };

        return number_val;
    };

    double eval_numeric_token_decimal_base(ParserContext& parser_context)
    {
        auto& lexer = parser_context.get_lexer();
        auto& lexer_context = lexer.get_lexer_context();

        auto current_token = parser_context.see_current_token();
        auto source_slice = lexer_context.source.slice(current_token.offset,current_token.length);
        auto current_char = source_slice.see_current();
        
        double number_val = 0;

        while (current_char != '\0')
        {
            Assert(
                    Util::TypeClassificator::is_numeric_char(current_char),
                    ParserError + 
                    "invalid binary number code, Lexer failed to validate bin code"s + 
                    ParserErrorEnd
            )

            unsigned int digit_value = 0;

            if (Util::TypeClassificator::is_numeric_char(current_char))
            {
                digit_value = current_char - '0';
            };

            source_slice.consume();
            current_char = source_slice.see_current();
            number_val *= 10;
            number_val += digit_value;
        };

        return number_val;
    };

    double get_unsigned_number_literal_value(ParserContext& parser_context)
    {
        auto current_token = parser_context.see_current_token();

        if (current_token.token_type != TokenType::Numeric)
        {
            parser_context.record_error(ParserErrorCode::InvalidExpression);
            return 0;
        };

        auto number_kind = parser_context.get_last_number_hint();

        if (number_kind.number_base == NumberBase::Binary)
        {
            return eval_numeric_token_bin_base(parser_context);
        } else if(number_kind.number_base == NumberBase::Hexdecimal)
        {
            return eval_numeric_token_hex_base(parser_context);
        } else if(number_kind.number_base == NumberBase::Decimal)
        {
            return eval_numeric_token_decimal_base(parser_context);
        }
    };

    double get_number_literal_value(ParserContext& parser_context)
    {
        auto current_token = parser_context.see_current_token();
        
        auto is_negative = false;

        if (current_token.token_type == TokenType::Symbol) //unary operation most likely
        {   
            auto symbol_kind = parser_context.get_last_symbol();
            is_negative = symbol_kind == SymbolKind::MINUS;
            parser_context.get_next_token();
        }

        auto number_val = get_unsigned_number_literal_value(parser_context);

        if (is_negative)
        {
            number_val *= -1;
        }

        return number_val;
    };

    SymbolKind get_symbol(ParserContext& parser_context)
    {
        auto next_token = parser_context.get_next_token();
        if (next_token.token_type != TokenType::Symbol)
        {
            parser_context.record_error(ParserErrorCode::InvalidExpression);
            return SymbolKind::UNKNOWN;
        }
        return parser_context.get_last_symbol();
    };

    double eval_local_expression(ParserContext& parser_context)
    {
        auto left_side_value = get_number_literal_value(parser_context);

        auto symbol_kind = get_symbol(parser_context);

        auto right_side_value = get_number_literal_value(parser_context);
        
        switch (symbol_kind)
        {
        case SymbolKind::MINUS:
            return left_side_value - right_side_value;        
        case SymbolKind::PLUS:
            return left_side_value + right_side_value;
        case SymbolKind::STAR:
            return left_side_value * right_side_value;
        case SymbolKind::SLASH:
            return left_side_value / right_side_value;
        default:
            parser_context.record_error(ParserErrorCode::InvalidExpression); //should be really InvalidMathExprSymbol
            return (double)0;
        }
    };

    double Parser::eval_math()
    {
        auto token = parser_context.get_next_token();
        return eval_local_expression(parser_context);
    };
};