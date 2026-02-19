#include <lexer/lexer.hpp>
#include <linear_allocator/linear_allocator.hpp>

namespace ASTParser{
    class ParserContext{
        Util::Lexer lexer;
        Util::LinearAllocator linear_allocator;
        
        public:
        ParserContext(Util::Source& source): lexer(source)
        {};

        bool generate_AST()
        {
            
        };
    };

    class Parser{
        ParserContext parser_context;
        public:

        Parser(Util::Source& source): parser_context(source)
        {};        

        bool generate_AST()
        {
            return parser_context.generate_AST();
        };
    };
};