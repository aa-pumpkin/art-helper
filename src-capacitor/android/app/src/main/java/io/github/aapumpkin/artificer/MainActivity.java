package io.github.aapumpkin.artificer;

import android.os.Bundle;
import android.view.View;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // без растягивания и «пружины» при прокрутке до упора — как в нативном приложении
        getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
    }
}
