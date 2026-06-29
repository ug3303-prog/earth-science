import { AppData } from "./types";

export const SEED: AppData = {
  className: "5학년 2반",
  activeUnit: "weather",
  units: {
    weather: {
      count: 18,
      groups: [
        { id: 1, name: "1모둠", f: "1013.2", s: "1011.8", r: "1009.5" },
        { id: 2, name: "2모둠", f: "1013.0", s: "1011.5", r: "1009.2" },
        { id: 3, name: "3모둠", f: "1012.8", s: "1011.9", r: "1021.0" },
        { id: 4, name: "4모둠", f: "1013.1", s: "1011.6", r: "1009.4" },
        { id: 5, name: "5모둠", f: "1012.9", s: "", r: "1009.6" },
      ],
      students: [
        { id: 1, name: "김민서", group: "3모둠", answer: "높은 곳으로 갈수록 기압이 점점 낮아졌다. 옥상이 제일 낮았다. 구름은 적운이었고 NASA에 제출했다.", evaluation: null, approved: false, record: null },
        { id: 2, name: "이준호", group: "1모둠", answer: "여러 장소에서 기압을 재고 막대그래프로 그렸다. 친구들과 같이 측정하고 구름 사진도 올렸다.", evaluation: null, approved: false, record: null },
        { id: 3, name: "박서연", group: "5모둠", answer: "옥상 기압을 측정해서 그래프를 그렸다. 그런데 단위를 안 적었다. 계단은 못 쟀다.", evaluation: null, approved: false, record: null },
        { id: 4, name: "정하늘", group: "2모둠", answer: "기압이 높이마다 달랐다. 구름 사진을 찍어서 GLOBE에 제출했다.", evaluation: null, approved: false, record: null },
        { id: 5, name: "최서준", group: "4모둠", answer: "측정을 했다.", evaluation: null, approved: false, record: null },
      ],
    },
    ecology: {
      count: 9,
      groups: [
        { id: 1, name: "1모둠", f: "32000", s: "4200", r: "8500" },
        { id: 2, name: "2모둠", f: "31000", s: "3900", r: "8200" },
        { id: 3, name: "3모둠", f: "33000", s: "4100", r: "8400" },
        { id: 4, name: "4모둠", f: "30500", s: "12000", r: "8300" },
        { id: 5, name: "5모둠", f: "31500", s: "4000", r: "" },
      ],
      students: [
        { id: 1, name: "한지우", group: "1모둠", answer: "양지가 제일 밝고 나무 그늘이 가장 어두웠다. 나무가 빛을 막아준다는 걸 알았다. 학교 단풍나무 높이도 쟀다.", evaluation: null, approved: false, record: null },
        { id: 2, name: "오세아", group: "2모둠", answer: "조도를 세 군데서 재고 막대그래프로 그렸다. 모둠이랑 나무 둘레도 측정해서 GLOBE에 올렸다.", evaluation: null, approved: false, record: null },
        { id: 3, name: "강나래", group: "3모둠", answer: "그늘이 시원한 이유를 알았다. 빛이 약해서다.", evaluation: null, approved: false, record: null },
        { id: 4, name: "임도윤", group: "4모둠", answer: "빛을 측정했다.", evaluation: null, approved: false, record: null },
        { id: 5, name: "신유나", group: "5모둠", answer: "양지랑 그늘 밝기가 많이 달랐다. 나무 그늘이 건물 그늘보다 더 어두웠다. 토지피복도 관찰해서 기록했다.", evaluation: null, approved: false, record: null },
      ],
    },
    noise: {
      count: 9,
      groups: [
        { id: 1, name: "1모둠", f: "41", s: "62", r: "78" },
        { id: 2, name: "2모둠", f: "39", s: "61", r: "79" },
        { id: 3, name: "3모둠", f: "42", s: "63", r: "77" },
        { id: 4, name: "4모둠", f: "70", s: "62", r: "78" },
        { id: 5, name: "5모둠", f: "40", s: "60", r: "" },
      ],
      students: [
        { id: 1, name: "윤서아", group: "1모둠", answer: "도서관이 제일 조용하고 운동장이 가장 시끄러웠다. 사람이 많으면 소음이 커진다는 걸 알았다. 우리동네 소음지도에 올렸다.", evaluation: null, approved: false, record: null },
        { id: 2, name: "배준서", group: "2모둠", answer: "세 곳에서 소음을 재고 막대그래프로 그렸다. 모둠이랑 같이 측정하고 소음지도에 기록했다.", evaluation: null, approved: false, record: null },
        { id: 3, name: "조하린", group: "3모둠", answer: "운동장이 시끄러운 이유를 생각해봤다. 소리가 컸다.", evaluation: null, approved: false, record: null },
        { id: 4, name: "문태양", group: "4모둠", answer: "소음을 측정했다.", evaluation: null, approved: false, record: null },
        { id: 5, name: "서다은", group: "5모둠", answer: "도서관과 운동장 소음 차이가 컸다. 소음이 심하면 공부에 방해된다는 걸 알았고 소음지도에 기록했다.", evaluation: null, approved: false, record: null },
      ],
    },
  },
};
