package kr.nuri.mind;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // 화면은 항상 100%로 — 휴대폰 시스템 글꼴 크기를 따라 커지면 레이아웃이 깨진다(앱 내 글자 크기 설정도 두지 않는다)
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().getSettings().setTextZoom(100);
        }
    }
}
