import Image from 'next/image';
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from 'uuid';

export default function Roulette({participants = [], minRollDuration, maxRollDuration, giveawayTitle}) {

    const { t } = useTranslation();

    const [rolling, setRolling] = useState(false);

    const [rouletteFill, setRouletteFill] = useState([]);

    const [roulettePosition, setRoulettePosition] = useState(0);

    const [rollDuration, setRollDuration] = useState(0);

    const [raffle, setRaffle] = useState(uuid().toString());

    const [winner, setWinner] = useState(null);

    const [rerollTrigger, setRerollTrigger] = useState(false);

    const updateGiveawayHistory = (winner) => {

        let giveawayHistory = localStorage.getItem("giveawayHistory");

        if(giveawayHistory) {
            giveawayHistory = JSON.parse(giveawayHistory);
        } else {
            giveawayHistory = {}
        }

        const now = new Date();
        const parsedNow = now.toLocaleDateString('pt-BR') + " - " + now.toLocaleTimeString('pt-BR', { hour: "numeric", minute: "numeric"});

        giveawayHistory[raffle] = {
            id: raffle,
            title: giveawayTitle,
            date: parsedNow.toString(),
            winner: winner
        }

        giveawayHistory = JSON.stringify(giveawayHistory);

        localStorage.setItem("giveawayHistory", giveawayHistory);

    }

    const roll = () => {

        if (rolling) {
            return;
        }

        setRolling(true);

        let entries = [];

        participants.forEach(entry => {
            for (let x = 0; x < entry.multiplier; x++) {
                entries.push(entry);
            }
        })

        const Winner = entries[Math.floor(Math.random() * entries.length)];

        const rouletteSize = window.innerWidth <= 767 ? 350 : 750;
        const blockSize = 100;

        const displayItems = Math.ceil(rouletteSize / blockSize);

        let minDuration = parseInt(minRollDuration) || 10000;
        let maxDuration = parseInt(maxRollDuration) || 16000;

        if(minDuration < 10000) minDuration = 10000;
        if(minDuration > 60000) minDuration = 60000;
        if(maxDuration < minDuration) maxDuration = minDuration;
        if(maxDuration > 60000) maxDuration = 60000;

        const minSlideDelay = 100;
        const maxSlideDelay = 300;

        const rollDuration = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;
        const slideDelay = Math.floor(Math.random() * (maxSlideDelay - minSlideDelay + 1)) + minSlideDelay;

        const rollFrames = parseInt(rollDuration / slideDelay);

        let fill = [];

        for (let x = 0; x < rollFrames + displayItems; x++) {

            if (x === (rollFrames + (displayItems / 2) - 1)) {
                fill.push(Winner);
            } else {
                fill.push(participants[Math.floor(Math.random() * participants.length)]);
            }

        }

        setRouletteFill(fill);

        setRollDuration(rollDuration);

        setRoulettePosition((blockSize * rollFrames) - (blockSize * 0.4) + (Math.random() * blockSize * 0.8));

        updateGiveawayHistory(Winner);

        setTimeout(() => {
            setWinner(Winner);
        }, rollDuration + 250);

    };

    useEffect(() => {
        if (rerollTrigger === true) {
            setRerollTrigger(false);
            roll();
        }
    }, [rerollTrigger]);

    const resetAndReroll = () => {
        // reset states
        setRolling(false);
        setRouletteFill([]);
        setRollDuration(0);
        setRoulettePosition(0);
        setWinner(null);

        // draw winner
        setRerollTrigger(true);
    }

    return (
        <div className="relative w-[750px] mt-7 pt-3 pb-3 bg-white rounded-xl drop-shadow-xl flex flex-col justify-center items-center md:w-[350px]">
            <span className="font-extralight select-none text-gray-500 xl:relative xl:right-0">{participants.length} {t("active_entries_text")}</span>
            {
                rolling ? (
                    <div className="absolute top-3 mt-8 bg-purple w-[10px] h-[10px] z-40 rotate-45"></div>
                ) : null
            }
            <div className="mt-3 flex flex-row overflow-hidden h-[100px] w-11/12 z-30" style={{ height: `${rolling ? "100px" : "0px"}` }}>
                <div id="roulette__container" className="relative h-full min-w-fit flex flex-row" style={{ transform: `translateX(-${roulettePosition}px)`, transition: `cubic-bezier(0.25, 0.46, 0.45, 1.0) ${rollDuration}ms` }}>

                {
                    rouletteFill.map((participant, i) => (

                        <div key={"proulette-" + i} className="w-[100px] h-[100px] bg-white border-[1px] border-r-0 border-solid border-purple flex flex-col justify-center items-center overflow-hidden">
                            <span className="text-purple text-extrabold text-xs sm:text-[3vw]">{participant.name}</span>
                            <span className="text-white text-extralight text-sm select-none bg-purple mt-[5px] pt-[1px] pb-[1px] pl-[5px] pr-[5px]">{`${participant.multiplier || 1}x`}</span>
                        </div>

                    ))
                }

                </div>

            </div>

            {
                winner && rolling ? (
                    <div className="w-full flex flex-col justify-center items-center">
                        <span className="text-gray-500 text-sm mt-3 font-extralight select-none">{t("roulette_winner")} <a className="hover:text-purple select-text">{winner.name}</a></span>
                        <div onClick={() => { resetAndReroll() }} className="border border-purple mt-3 pl-[20px] pr-[20px] h-[40px] rounded-xl flex flex-row justify-center items-center text-purple select-none hover:scale-105 transition-all ease-in-out duration-50">{t("roulette_redraw_button")}</div>
                    </div>
                ) : null
            }

            {
                !winner && rolling === true ? (
                    <div className="w-full flex flex-col justify-center items-center">
                        <span className="text-gray-500 text-sm mt-3 font-extralight select-none">{t("roulette_awaiting_winner")}</span>
                    </div>
                ) : null
            }

            {
                !rolling && !winner ? (
                    <Image alt="Loading" width={38} height={38} src="/images/loading.svg" />
                ) : null
            }

            {
                !rolling && !winner ? (
                    <div onClick={() => { roll() }} className="border border-purple mt-3 pl-[20px] pr-[20px] h-[40px] rounded-xl flex flex-row justify-center items-center text-purple select-none hover:scale-105 transition-all ease-in-out duration-50">{t("roulette_draw_button")}</div>
                ) : null
            }

        </div>
    )
}