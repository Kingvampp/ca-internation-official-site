import { clientDb } from '../utils/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { fallbackGalleryItems } from '../utils/galleryService';

const COLLECTION_NAME = 'galleryItems';

async function checkFirestore() {
    console.log('🔍 Starting Firestore check...\n');

    try {
        // Get all items from Firestore
        console.log('📥 Fetching items from Firestore...');
        const galleryRef = collection(clientDb, COLLECTION_NAME);
        const q = query(galleryRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot || !querySnapshot.docs) {
            console.error('❌ Failed to fetch items from Firestore');
            return;
        }

        const firestoreItems = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ Found ${firestoreItems.length} items in Firestore`);
        console.log(`📝 Local gallery has ${fallbackGalleryItems.length} items\n`);

        // Compare counts
        if (firestoreItems.length !== fallbackGalleryItems.length) {
            console.warn('⚠️ Item count mismatch:');
            console.warn(`   Firestore: ${firestoreItems.length}`);
            console.warn(`   Local: ${fallbackGalleryItems.length}\n`);
        }

        // Check each local item exists in Firestore
        console.log('🔄 Checking local items against Firestore...');
        for (const localItem of fallbackGalleryItems) {
            const firestoreItem = firestoreItems.find(item => item.id === localItem.id);
            
            if (!firestoreItem) {
                console.warn(`⚠️ Item missing from Firestore: ${localItem.id} - ${localItem.title}`);
                continue;
            }

            // Check for structural differences
            const differences = findDifferences(localItem, firestoreItem);
            if (Object.keys(differences).length > 0) {
                console.warn(`\n⚠️ Differences found for item ${localItem.id} - ${localItem.title}:`);
                console.warn(JSON.stringify(differences, null, 2));
            }
        }

        // Check for extra items in Firestore
        console.log('\n🔄 Checking Firestore items against local...');
        for (const firestoreItem of firestoreItems) {
            const localItem = fallbackGalleryItems.find(item => item.id === firestoreItem.id);
            if (!localItem) {
                console.warn(`⚠️ Extra item in Firestore: ${firestoreItem.id} - ${firestoreItem.title}`);
            }
        }

        console.log('\n✅ Firestore check completed');

    } catch (error) {
        console.error('❌ Error checking Firestore:', error);
    }
}

function findDifferences(localItem: any, firestoreItem: any): Record<string, any> {
    const differences: Record<string, any> = {};
    
    // Compare all properties except timestamps
    for (const key of Object.keys(localItem)) {
        if (key === 'createdAt' || key === 'updatedAt') continue;
        
        if (JSON.stringify(localItem[key]) !== JSON.stringify(firestoreItem[key])) {
            differences[key] = {
                local: localItem[key],
                firestore: firestoreItem[key]
            };
        }
    }

    return differences;
}

// Run the check
checkFirestore();
