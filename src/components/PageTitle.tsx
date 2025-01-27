import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { matchPath } from "react-router-dom";

const PageTitle = () => {
  const location = useLocation();

  const getLastPathParam = (path: string): string => {
    const segments = path.split('/').filter(Boolean);  // '/' 기준으로 나누기
    return segments.pop() || '';       // 마지막 요소 가져오기 (없으면 빈 문자열)
  };

  useEffect(() => {
    const path = location.pathname;
    const param = getLastPathParam(path);

    // 페이지별 제목 매핑
    const titleMap: { [key: string]: string } = {
      "/": "홈",
      "/login": "로그인",
      "/contest": "대회 목록",
      "/contest/make": "대회 생성",
      "/problem": "문제 목록",
      "/setting": "설정",
    };

    // 동적 경로를 위한 패턴 매칭
    const dynamicRoutes = [
      { pattern: "/contest/edit/:contestId", title: "대회 수정" },
      { pattern: "/contest/manage/:contestId", title: "대회 관리" },
      { pattern: "/contest/:contestId", title: "대회 상세" },
      { pattern: "/problem/edit/:problemId", title: "문제 수정" },
      { pattern: "/problem/make/:contestId", title: "문제 생성" },
      { pattern: "/problem/:problemId", title: "문제 상세" },
      { pattern: "/score/:contestId", title: "스코어보드" },
      { pattern: "/user/:userId", title: `사용자 ${param}`},
    ];

    let title = titleMap[path] || "MiC";

    // 동적 경로 확인
    for (const route of dynamicRoutes) {
      if (matchPath(route.pattern, path)) {
        title = route.title;
        break;
      }
    }

    document.title = title + " | MiC";
  }, [location.pathname]);

  return null;
};

export default PageTitle;