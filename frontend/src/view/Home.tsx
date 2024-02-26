import {
    VStack,
    Heading,
    Text,
    Box,
    Textarea,
    HStack,
    Button,
    Divider,
    IconButton,
    useToast,
    Input,
    InputGroup,
    InputLeftElement,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    ButtonGroup,
} from "@chakra-ui/react";
import { languages } from "../constants";
import { memo, useEffect, useState } from "react";
import axios from "axios";
import { IoSearch } from "react-icons/io5";
import { FaPlus, FaTimes } from "react-icons/fa";

const chunkArray = (data: any, chunkSize: number): any => {
    let i: number | string = 0;
    let resultArray: any[] = [];
    let chunkArray: any[] = [];
    for (i in data) {
        chunkArray.push(data[i]);
        if ((Number(i) + 1) % chunkSize === 0) {
            resultArray.push(chunkArray);
            chunkArray = [];
        }
    }
    return resultArray;
};

const Home = () => {
    const toast = useToast();

    // どちらも言語コードを格納している
    const [fromLanguage, setFromLanguage] = useState<string>("en-GB");
    const [toLanguages, setToLanguages] = useState<string[]>(["ja-JP", "fr-FR", "ar-SA"]);
    const [source, setSource] = useState<string>("Hello.");
    const [results, setResults] = useState(["", "", ""]);

    const filterArray = (data: any[], query: string) => {
        return data.filter((i) => i[1].toLowerCase().includes(query.toLowerCase()));
    };
    interface LanguageSelectButtonProp {
        label: string | React.ReactElement;
        width: string;
        set: "to" | "from";
        index?: number;
    }

    const LanguageSelectButton = memo(({ label, width, set, index }: LanguageSelectButtonProp) => {
        const [searchQuery, setSearchQuery] = useState("");
        return (
            <Popover>
                <PopoverTrigger>
                    <Button colorScheme="teal" w={width}>
                        {label}
                    </Button>
                </PopoverTrigger>
                <PopoverContent w={800}>
                    <PopoverBody>
                        <Box bg="white" px={10} py={8}>
                            {searchQuery}
                            <InputGroup my="0.5rem">
                                <InputLeftElement pointerEvents="none">
                                    <IoSearch size="1.5rem" />
                                </InputLeftElement>
                                <Input
                                    h="2.5rem"
                                    placeholder="Search language..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                    }}
                                />
                            </InputGroup>
                            <HStack>
                                {chunkArray(filterArray(Object.entries(languages), searchQuery), 10).map(
                                    (chunk: any, hIndex: number) => (
                                        <VStack key={hIndex}>
                                            {chunk.map(([code, name]: string[], vIndex: number) => {
                                                return (
                                                    <Box
                                                        key={vIndex}
                                                        onClick={() => {
                                                            if (set === "to") {
                                                                if (
                                                                    // すでに選択言語があるとき
                                                                    toLanguages.includes(code)
                                                                ) {
                                                                    toast({
                                                                        title: "alert",
                                                                        description: "You already have that language.",
                                                                        status: "warning",
                                                                        duration: 3000,
                                                                        isClosable: true,
                                                                    });
                                                                } else {
                                                                    if (index !== undefined) {
                                                                        // 言語を変更するケース
                                                                        setToLanguages(
                                                                            toLanguages.map((toLanguage, i) =>
                                                                                i === index ? code : toLanguage
                                                                            )
                                                                        );
                                                                    } else {
                                                                        // 言語を追加するケース
                                                                        setToLanguages([...toLanguages, code]);
                                                                    }
                                                                }
                                                            } else if (set === "from") {
                                                                // 翻訳元言語を指定する
                                                                setFromLanguage(code);
                                                            }
                                                        }}
                                                    >
                                                        <Button size="sm" w="6rem" colorScheme="gray">{name}</Button>
                                                    </Box>
                                                );
                                            })}
                                        </VStack>
                                    )
                                )}
                            </HStack>
                        </Box>
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        );
    });

    useEffect(() => {
        // Promiseを集めるための配列
        const promises = toLanguages.map((toLanguage) => {
            // 各言語ごとに翻訳をリクエストし、Promiseを返す
            return axios
                .get(`https://api.mymemory.translated.net/get?q=${source}&langpair=${fromLanguage}|${toLanguage}`)
                .then((response) => response.data.responseData.translatedText)
                .catch((error) => {
                    console.error("Translation error:", error);
                    return "";
                });
        });

        // 全てのPromiseが完了するのを待ち、結果をセットする
        Promise.all(promises)
            .then((translatedTexts) => {
                setResults(translatedTexts); // 翻訳結果をセット
            })
            .catch((error) => {
                console.error("Translation error:", error);
            });
    }, [source, fromLanguage, toLanguages]);
    return (
        <>
            <Box p={20}>
                <VStack bg="gray.100" spacing={5}>
                    <Heading size="2xl">PolyTrans</Heading>
                    <Text>多言語同時翻訳アプリ！</Text>
                    <HStack>
                        <LanguageSelectButton label={languages[fromLanguage]} width="9rem" set="from" />

                        <Textarea
                            h={75}
                            w={250}
                            bg="white"
                            resize="none"
                            placeholder="Please enter your sentence..."
                            value={source}
                            onChange={(e) => {
                                setSource(e.target.value);
                            }}
                        />
                    </HStack>

                    <Divider borderColor="gray.300" borderWidth={1} />

                    <VStack>
                        {toLanguages.map((toLanguage, index) => {
                            return (
                                <HStack key={index}>
                                    <ButtonGroup isAttached colorScheme="teal">
                                        <IconButton
                                            aria-label="remove language"
                                            colorScheme="teal"
                                            w="3rem"
                                            icon={<FaTimes />}
                                            onClick={() => {
                                                // バツボタンで翻訳先を削除
                                                // - 1してるのは、バツボタンを押した後の判定にするため
                                                if (toLanguages.length - 1 !== 0) {
                                                    setToLanguages((toLanguages) =>
                                                        toLanguages.filter((i) => i !== toLanguage)
                                                    );
                                                }
                                            }}
                                        />
                                        <LanguageSelectButton
                                            label={languages[toLanguage]}
                                            width="6rem"
                                            set="to"
                                            index={index}
                                        />
                                    </ButtonGroup>
                                    <Textarea h={75} w={250} bg="white" resize="none" value={results[index]} />
                                </HStack>
                            );
                        })}
                        {/* 翻訳先言語の追加 */}
                        <LanguageSelectButton label={<FaPlus />} width="2rem" set="to" />
                    </VStack>
                </VStack>
            </Box>
        </>
    );
};

export default Home;
