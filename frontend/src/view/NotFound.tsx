import { Box, Center, Heading, Text, VStack } from "@chakra-ui/react";

const NotFound = () => {
    return (
        <>
            <Box>
                <Center h="100vh">
                    <VStack>
                        <Heading size="4xl">404</Heading>
                        <Text fontSize="2xl">Page Not Found ...</Text>
                    </VStack>
                </Center>
            </Box>
        </>
    );
};

export default NotFound;
